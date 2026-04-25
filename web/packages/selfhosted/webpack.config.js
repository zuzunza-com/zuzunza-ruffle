import url from "url";
import json5 from "json5";
import CopyPlugin from "copy-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import webpack from "webpack";

function transformPackage(content) {
    const pkg = json5.parse(content);

    // Note: The npm registry requires the version to monotonically increase.
    pkg.version = process.env.npm_package_version;

    return JSON.stringify(pkg);
}

export default function (_env, _argv) {
    const mode = process.env.NODE_ENV || "production";
    console.log(`Building ${mode}...`);

    /** 소스맵: 역분석 완화를 위해 프로덕션 기본값은 끔. 디버그 시 ZUZUNZA_RUFFLE_SOURCEMAP=1 */
    const wantSourceMap =
        mode === "development" || process.env.ZUZUNZA_RUFFLE_SOURCEMAP === "1";

    /** Comma-separated page origins allowed to run this build (e.g. https://www.example.com,http://localhost:3000). Empty = no lock (local dev). */
    const allowedOriginsRaw = process.env.ZUZUNZA_RUFFLE_ALLOWED_ORIGINS?.trim() ?? "";
    const allowedOriginsList = allowedOriginsRaw
        ? allowedOriginsRaw
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : [];

    return {
        mode,
        entry: "./js/ruffle.js",
        output: {
            path: url.fileURLToPath(new URL("dist", import.meta.url)),
            filename: "ruffle.js",
            publicPath: "",
            chunkFilename: "core.ruffle.[contenthash].js",
            clean: true,
        },
        performance: {
            assetFilter: (assetFilename) =>
                !/\.(map|wasm)$/i.test(assetFilename),
        },
        optimization: {
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        output: {
                            ascii_only: true,
                        },
                    },
                }),
            ],
        },
        devtool: wantSourceMap ? "source-map" : false,
        plugins: [
            new webpack.DefinePlugin({
                /**
                 * DefinePlugin 값은 번들에 그대로 끼워 넣는다.
                 * `JSON.stringify([])` 만 쓰면 `[]` 가 **배열 리터럴**로 들어가 `JSON.parse` 가 깨진다.
                 * 항상 **JSON 문자열 리터럴**이 되도록 이중 stringify.
                 */
                __ZUZUNZA_ALLOWED_ORIGINS_JSON__: JSON.stringify(
                    JSON.stringify(allowedOriginsList),
                ),
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: "npm-package.json5",
                        to: "package.json",
                        transform: transformPackage,
                    },
                    { from: "LICENSE*" },
                    { from: "README.md" },
                ],
            }),
        ],
    };
}
