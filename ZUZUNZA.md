# Zuzunza Ruffle 포크

이 저장소는 [Ruffle](https://github.com/ruffle-rs/ruffle) upstream을 기반으로 Zuzunza Waterscape(키즈짱·플래시 게임 등)에 맞게 수정한 포크입니다.

## 브랜딩

- UI 문자열: **ZUZUNZA Player by CreVision** (컨텍스트 메뉴 About 등)
- 링크 기준 URL: `https://www.zuzunza.com` (`web/packages/core/src/internal/constants.tsx`의 `ZUZUNZA_ORIGIN`)
- **Secure Branding Lock**: 로드 옵션 `brandingLock: true` 시 우클릭 메뉴에서 **SWF 다운로드·디버그 정보 복사** 비활성화 (About은 zuzunza.com으로 유지)

## ZetEnc (네이티브 복호화)

- Go `wscp-library/zetenc`와 동일 알고리즘: 크레이트 [`zuzunza_zetenc`](zuzunza_zetenc/)
- `RuffleInstanceBuilder` / 로드 옵션: `zetencRadius`, `zetencSeed` (둘 다 설정 시 `ZET` 매직 프리픽스가 있는 응답 본문을 WASM에서 복호화)
- 프록시가 ZET 암호문을 그대로 내려줄 때는 쿼리 `zetencPassthrough=1` 사용 (Waterscape `wscp-middleware`·memphis `proxy-swf` 지원)

## 웹 IME

- upstream PR [#19896](https://github.com/ruffle-rs/ruffle/pull/19896)의 핵심 커밋을 `zuzunza/develop`에 체리픽함 (`web: Implement basic IME`).

## 빌드·난독화

- Release: `cargo build -p ruffle_web --release --target wasm32-unknown-unknown` 후 `wasm-bindgen`·번들은 [web/README.md](web/README.md) 및 [`.github/workflows/test_web.yml`](.github/workflows/test_web.yml) 참고
- 프로덕션 번들: webpack production 모드(기본 minify). 추가로 `wasm-opt -Oz` 적용 가능(바이너리 설치 필요)
- 소스맵은 프로덕션 아티팩트에서 끄는 것을 권장

## Upstream 동기화

```bash
git fetch upstream
git checkout zuzunza/develop
git merge upstream/master   # 기본 브랜치명 확인
```

## Waterscape 연동

- `NEXT_PUBLIC_RUFFLE_URL` — 자체 빌드한 `ruffle.js` URL
- `NEXT_PUBLIC_ZETENC_NATIVE=1` — 프록시에 `zetencPassthrough=1` 전달 (memphis)
- `NEXT_PUBLIC_ZETENC_RADIUS` / `NEXT_PUBLIC_ZETENC_SEED` — ZetEnc 키(클라이언트 노출 주의)
- `NEXT_PUBLIC_ZUZUNZA_BRANDING_LOCK=1` — 브랜딩 락

## 라이선스

Upstream Ruffle과 동일합니다. `LICENSE.md`·`CONTRIBUTING.md` 참고.
