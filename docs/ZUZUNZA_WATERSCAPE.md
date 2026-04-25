# ZUZUNZA / Waterscape 6.x — 이 Ruffle 포크

이 저장소는 **Ruffle** 상류(U.S.M.)를 기반으로 한 **ZUZUNZA** 전용 포크이며, **Flash 재생·CORS**는 `wscp-frontend` / `wscp-superkomi` / 게이트웨이 `NEXT_PUBLIC_RUFFLE_URL` · `ZUZUNZA_RUFFLE_ALLOWED_ORIGINS`와 맞출 것.

## Turborepo / pnpm (통합 `src/`)

- 상위 **통합 모노레포** `src/pnpm-workspace.yaml`에 `zuzunza-ruffle/web` 등이 포함될 수 있다.
- **빌드(웹)**: `src/` 루트에서 `pnpm install` 후 `pnpm turbo run build --filter=…` (패키지명은 `zuzunza-ruffle/web/package.json` 참고) 또는 Ruffle 자체 `web/`의 문서.

## 공개

- **Ruffle 포크**는 **public** 권장(빌드·감사·이슈 추적) — [Waterscape 저장소 가시성](https://github.com/zuzunza-com/zuzunza-waterscape/blob/main/docs/REPOSITORY_VISIBILITY.md) (URL은 org/레포명에 맞게 조정).

## 관련

- ZUZUNZA 통합 `src` 개요: `src/README.md` (이 포크는 보통 `src/zuzunza-ruffle/…`이므로 상대 경로 `../../README.md`)
