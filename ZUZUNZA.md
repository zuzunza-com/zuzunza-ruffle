# Zuzunza Ruffle 포크

이 저장소는 [Ruffle](https://github.com/ruffle-rs/ruffle) upstream을 기반으로 Zuzunza Waterscape(키즈짱·플래시 게임 등)에 맞게 수정·실험하기 위한 포크입니다.

## Upstream 동기화

```bash
git fetch upstream
git checkout zuzunza/develop   # 작업 브랜치
git merge upstream/master      # 또는 upstream의 기본 브랜치명에 맞출 것
```

초기 클론 시 원격 이름은 다음과 같이 맞춰 두는 것을 권장합니다.

```bash
git remote rename origin upstream
git remote add origin <여러분의 zuzunza-ruffle Git URL>
git push -u origin zuzunza/develop
```

## 목표(우선순위 예시)

- 웹 셀프호스팅 환경에서 **한글 IME·텍스트 필드** 동작 개선 (관련 upstream 이슈: [#1778](https://github.com/ruffle-rs/ruffle/issues/1778))
- **키보드 포커스·캔버스 입력** 안정화 (클라이언트 측 보완은 `wscp-memphis-core-serven`의 `ruffle-input-patch`와 병행)
- Zuzunza 배포용 **WASM/JS 빌드** 산출물을 CI 또는 로컬에서 재현 가능하게 유지

## 빌드

상세 빌드·테스트 절차는 upstream 루트의 `README.md` 및 [Ruffle 개발자 문서](https://github.com/ruffle-rs/ruffle/wiki)를 따릅니다.

웹 패키지 빌드 개요(환경에 따라 경로·명령이 다를 수 있음):

```bash
# Rust toolchain (rustup), wasm32 target, 기타 의존성 설치 후
cargo build --release -p ruffle_web
```

실제 워크스페이스 구조는 upstream 버전에 따라 달라질 수 있으므로, 클론 직후 `Cargo.toml`·`web/` 디렉터리를 확인하세요.

## Waterscape 앱과 연결

빌드한 `dist/ruffle.js`(및 WASM)를 정적 호스팅하거나 패키지로 배포한 뒤, Next 앱에서 다음 환경 변수로 지정할 수 있습니다.

- `NEXT_PUBLIC_RUFFLE_URL` — 자체 호스팅 Ruffle 번들 URL

## 라이선스

Upstream Ruffle과 동일한 라이선스 정책을 따릅니다. 저장소 루트의 `LICENSE.md`·`CONTRIBUTING.md`를 참고하세요.
