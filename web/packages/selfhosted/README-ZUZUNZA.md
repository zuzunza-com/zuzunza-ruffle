# Zuzunza self-hosted bundle

## Origin lock

Production builds should restrict which sites may execute the player. Set at **build time**:

```bash
export ZUZUNZA_RUFFLE_ALLOWED_ORIGINS="https://www.example.com,https://kids.example.com,http://localhost:3000"
pnpm --filter ruffle-selfhosted run build
```

Empty/unset = no runtime check (local development). Non-empty = `window.location.origin` must be in the list or the bundle throws on load.

## Obfuscator.io Pro — VM 난독화 (selfhosted 번들만)

`pnpm --filter ruffle-selfhosted run build` 는 webpack 직후 `scripts/obfuscate-ruffle-pro.mjs` 를 실행한다. **API 토큰이 없으면** VM 단계는 건너뛴다(로컬 개발).

1. [대시보드 → API Keys](https://obfuscator.io/dashboard/settings/api-keys) 에서 키를 발급한다. 키는 저장소에 넣지 말고 CI/배포 환경 변수로만 설정한다.
2. 빌드 전에 다음 중 하나를 설정한다.

```bash
export OBFUSCATOR_API_TOKEN="…"   # 공식 이름
# 또는
export ZUZUNZA_OBFUSCATOR_IO_TOKEN="…"
```

3. 선택 옵션(Pro):

| 환경 변수 | 설명 |
|-----------|------|
| `ZUZUNZA_OBFUSCATOR_VM_SELF_DEFENDING=1` | `vmSelfDefending` + `vmDebugProtection` (헤드리스·Puppeteer 등 자동화 환경에서 동작이 깨질 수 있음) |
| `ZUZUNZA_OBFUSCATOR_VM_JSON` | 추가 옵션 JSON 문자열 ([VM 문서](https://obfuscator.io/docs/vm-obfuscation) 참고) |

4. 프로덕션 번들은 기본적으로 **소스맵을 생성하지 않는다**. 디버그가 필요하면 `ZUZUNZA_RUFFLE_SOURCEMAP=1` 을 설정한다.

참고: VM 난독화는 `dist/*.js`(webpack이 만든 selfhosted JS)에만 적용된다. WASM(`*.wasm`)은 별도 단계다.

## ZetEnc (client decrypt)

Configure the embedding app (`NEXT_PUBLIC_ZETENC_RADIUS`, `NEXT_PUBLIC_ZETENC_SEED`) and pass `zetencRadius` / `zetencSeed` into `player.load()`. Encrypted SWF bodies with the `ZET` prefix are decrypted in WASM (see `zuzunza_zetenc`).

## Build and deploy (wscp)

- **Bundle output:** `wscp-superkomi/scripts/build-ruffle.sh` builds this package and writes `ruffle.js` (and assets) under `dist/external/superkomi/<rev>/ruffle/`. Override repo path with `ZUZUNZA_RUFFLE_ROOT` if needed; force rebuild with `ZUZUNZA_RUFFLE_FORCE=1`.
- **zuzunza-compose deploy:** `scripts/zuzunza_compose_build.py` → `ensure_ruffle_bundle()` runs `build-ruffle.sh` and **merges** `~/conf.d/env.conf` (or `ZUZUNZA_ENV_CONF`) into the subprocess: `OBFUSCATOR_API_TOKEN`, `ZUZUNZA_OBFUSCATOR_*`, and every `ZUZUNZA_RUFFLE_*` key — so Pro VM + origin lock need no manual `export` during deploy. Manual runs can use `ZUZUNZA_RUFFLE_LOAD_ENV_CONF=1` on `build-ruffle.sh` to `source` the same file.
- **Runtime URL:** `wscp-frontend` uses `NEXT_PUBLIC_RUFFLE_URL` (e.g. `/player/wasm/ruffle/ruffle.js`). `createRufflePlayer` omits `backgroundColor` unless `meta.flash_composition` supplies it so the SWF stage color is used (see `lib/client_core/flash.ts`).
