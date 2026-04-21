/**
 * Zuzunza / Waterscape — 게임 로딩 화면(FlashLoadingOverlay)과 동일한 에디토리얼 톤.
 * Waterscape 앱은 보통 splashScreen: false 로 외부 오버레이만 쓰고, 확장·단독 임베드에서는 이 화면이 표시된다.
 *
 * @returns The HTMLElement containing the splash screen
 */
export function SplashScreen() {
    return (
        <div id="splash-screen" class="hidden">
            <div class="splash-backdrop" aria-hidden="true" />
            <div class="splash-brand-corner" aria-hidden="true">
                <div class="splash-corner-title">ZUZUNZA</div>
                <div class="splash-corner-sub">Waterscape</div>
            </div>
            <div class="splash-main">
                <div class="splash-kicker">KIDSZZANG · ZUZUNZA</div>
                <div class="splash-sub">Flash Player</div>
                <div class="splash-title">게임 불러오는 중</div>
                <p class="splash-wasm-hint">플레이어 엔진 로드 중…</p>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="loading-animation"
                    viewBox="0 0 66 66"
                    aria-hidden="true"
                >
                    <circle
                        xmlns="http://www.w3.org/2000/svg"
                        class="spinner"
                        fill="none"
                        stroke-width="6"
                        stroke-linecap="round"
                        cx="33"
                        cy="33"
                        r="30"
                    ></circle>
                </svg>
                <div class="loadbar">
                    <div class="loadbar-inner"></div>
                </div>
                <p class="splash-hint">처음 로드 시 시간이 조금 걸릴 수 있어요.</p>
            </div>
        </div>
    );
}
