#!/usr/bin/env node
/**
 * Obfuscator.io Pro — VM 난독화 (webpack 번들 산출물에만 적용).
 * Pro API 실패 시 로컬 javascript-obfuscator 로 폴백(CI/배포 호환).
 * 토큰이 없고 CI가 아니면 난독화 생략(로컬 개발).
 *
 * @see https://obfuscator.io/docs/vm-obfuscation
 * @see https://obfuscator.io/docs/api
 *
 * 환경 변수:
 * - OBFUSCATOR_API_TOKEN (공식) 또는 ZUZUNZA_OBFUSCATOR_IO_TOKEN (별칭)
 * - ZUZUNZA_OBFUSCATOR_VM_JSON: 추가/덮어쓸 옵션 JSON (선택)
 * - ZUZUNZA_OBFUSCATOR_VM_SELF_DEFENDING=1: vmSelfDefending + vmDebugProtection (헤드리스/자동화 테스트 깨질 수 있음)
 * - ZUZUNZA_OBFUSCATOR_FORCE_LOCAL=1: Pro API 건너뛰고 로컬 난독화만 사용
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import JavaScriptObfuscator from "javascript-obfuscator";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");

const token =
    process.env.OBFUSCATOR_API_TOKEN?.trim() ||
    process.env.ZUZUNZA_OBFUSCATOR_IO_TOKEN?.trim() ||
    "";

const forceLocal = process.env.ZUZUNZA_OBFUSCATOR_FORCE_LOCAL === "1";
const useLocalInCi = process.env.CI === "true";

if (!token && !forceLocal && !useLocalInCi) {
    console.warn(
        "[zuzunza-ruffle] obfuscate-pro: API 토큰 없음 (OBFUSCATOR_API_TOKEN) — VM 난독화 생략.",
    );
    process.exit(0);
}

function loadExtraVmOptions() {
    const raw = process.env.ZUZUNZA_OBFUSCATOR_VM_JSON?.trim();
    if (!raw) {
        return {};
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.error("[zuzunza-ruffle] ZUZUNZA_OBFUSCATOR_VM_JSON 파싱 실패:", e);
        process.exit(1);
    }
}

const baseVmOptions = {
    vmObfuscation: true,
    vmObfuscationThreshold: 1,
    compact: true,
    target: "browser",
    ...(process.env.ZUZUNZA_OBFUSCATOR_VM_SELF_DEFENDING === "1"
        ? { vmSelfDefending: true, vmDebugProtection: true }
        : {}),
};

const vmOptions = { ...baseVmOptions, ...loadExtraVmOptions() };

const localOptions = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.5,
    deadCodeInjection: false,
    debugProtection: false,
    identifierNamesGenerator: "hexadecimal",
    log: false,
    renameGlobals: false,
    rotateStringArray: true,
    selfDefending: false,
    stringArray: true,
    stringArrayThreshold: 0.75,
    unicodeEscapeSequence: false,
};

function shouldFallbackToLocal(error) {
    const message = String(error?.message ?? error ?? "");
    return (
        message.includes("API access is not available") ||
        message.includes("upgrade to use the API") ||
        message.includes("ApiError")
    );
}

function obfuscateLocal(code) {
    return JavaScriptObfuscator.obfuscate(code, localOptions).getObfuscatedCode();
}

async function obfuscateFile(code, name) {
    if (!forceLocal && token) {
        try {
            const result = await JavaScriptObfuscator.obfuscatePro(
                code,
                vmOptions,
                { apiToken: token },
            );
            return { output: result.getObfuscatedCode(), mode: "pro-vm" };
        } catch (error) {
            if (!shouldFallbackToLocal(error)) {
                throw error;
            }
            console.warn(
                `[zuzunza-ruffle] obfuscate-pro VM unavailable for ${name}: ${error.message}`,
            );
            console.warn(
                "[zuzunza-ruffle] falling back to local javascript-obfuscator",
            );
        }
    }

    const output = obfuscateLocal(code);
    return { output, mode: "local" };
}

async function main() {
    if (!fs.existsSync(distDir)) {
        console.error("[zuzunza-ruffle] dist/ 없음 — 먼저 webpack을 실행하세요.");
        process.exit(1);
    }
    const files = fs
        .readdirSync(distDir)
        .filter((f) => f.endsWith(".js") && !f.endsWith(".map"));

    if (files.length === 0) {
        console.warn("[zuzunza-ruffle] dist에 .js 파일 없음");
        process.exit(0);
    }

    for (const name of files.sort()) {
        const fp = path.join(distDir, name);
        const code = fs.readFileSync(fp, "utf8");
        const sizeKb = (code.length / 1024).toFixed(1);
        process.stdout.write(
            `[zuzunza-ruffle] obfuscate: ${name} (${sizeKb} KiB) ... `,
        );
        const t0 = Date.now();
        try {
            const { output, mode } = await obfuscateFile(code, name);
            fs.writeFileSync(fp, output);
            const outKb = (output.length / 1024).toFixed(1);
            console.log(`ok [${mode}] (${Date.now() - t0} ms, ${outKb} KiB)`);
        } catch (e) {
            console.log("FAILED");
            console.error(e);
            process.exit(1);
        }
    }
}

await main();
