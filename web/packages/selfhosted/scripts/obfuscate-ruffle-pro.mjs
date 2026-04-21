#!/usr/bin/env node
/**
 * Obfuscator.io Pro — VM 난독화 (webpack 번들 산출물에만 적용).
 * 토큰이 없으면 아무 것도 하지 않고 종료(로컬 빌드 호환).
 *
 * @see https://obfuscator.io/docs/vm-obfuscation
 * @see https://obfuscator.io/docs/api
 *
 * 환경 변수:
 * - OBFUSCATOR_API_TOKEN (공식) 또는 ZUZUNZA_OBFUSCATOR_IO_TOKEN (별칭)
 * - ZUZUNZA_OBFUSCATOR_VM_JSON: 추가/덮어쓸 옵션 JSON (선택)
 * - ZUZUNZA_OBFUSCATOR_VM_SELF_DEFENDING=1: vmSelfDefending + vmDebugProtection (헤드리스/자동화 테스트 깨질 수 있음)
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

if (!token) {
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
            `[zuzunza-ruffle] obfuscate-pro VM: ${name} (${sizeKb} KiB) ... `,
        );
        const t0 = Date.now();
        try {
            const result = await JavaScriptObfuscator.obfuscatePro(
                code,
                vmOptions,
                { apiToken: token },
            );
            fs.writeFileSync(fp, result.getObfuscatedCode());
            console.log(`ok (${Date.now() - t0} ms)`);
        } catch (e) {
            console.log("FAILED");
            console.error(e);
            process.exit(1);
        }
    }
}

await main();
