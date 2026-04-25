// eslint-disable-next-line no-unused-vars
/* global __webpack_public_path__:writable, __ZUZUNZA_ALLOWED_ORIGINS_JSON__:writable */

import { Setup } from "ruffle-core";

/**
 * Origin lock: production bundles should set `ZUZUNZA_RUFFLE_ALLOWED_ORIGINS` at webpack build time
 * (comma-separated `window.location.origin` values). Empty list = no check (developer convenience).
 */
function readAllowedOriginsList() {
    let raw;
    try {
        raw =
            typeof __ZUZUNZA_ALLOWED_ORIGINS_JSON__ !== "undefined"
                ? String(__ZUZUNZA_ALLOWED_ORIGINS_JSON__)
                : "[]";
    } catch {
        return [];
    }
    const trimmed = (raw || "").trim();
    if (trimmed === "") {
        return [];
    }
    let parsed;
    try {
        parsed = JSON.parse(trimmed);
    } catch {
        return null;
    }
    if (Array.isArray(parsed)) {
        return parsed;
    }
    if (typeof parsed === "string") {
        try {
            const again = JSON.parse(parsed);
            return Array.isArray(again) ? again : [];
        } catch {
            return null;
        }
    }
    return null;
}

function assertZuzunzaOriginAllowed() {
    const allowed = readAllowedOriginsList();
    if (allowed == null) {
        console.warn("[zuzunza-ruffle] invalid __ZUZUNZA_ALLOWED_ORIGINS_JSON__, skipping origin lock");
        return;
    }
    if (!Array.isArray(allowed) || allowed.length === 0) {
        return;
    }
    const here = window.location.origin;
    if (!allowed.includes(here)) {
        const msg = `[zuzunza-ruffle] Origin not allowed: ${here}`;
        console.error(msg, "allowed:", allowed);
        throw new Error(msg);
    }
}

assertZuzunzaOriginAllowed();

let currentScriptURL = null;

try {
    if (
        document.currentScript instanceof HTMLScriptElement &&
        document.currentScript.src !== ""
    ) {
        let src = document.currentScript.src;

        // CDNs allow omitting the filename. If it's omitted, append a slash to
        // prevent the last component from being dropped.
        if (!src.endsWith(".js") && !src.endsWith("/")) {
            src += "/";
        }

        currentScriptURL = new URL(".", src);
    }
} catch (e) {
    console.warn("Unable to get currentScript URL", e);
}

function publicPath(config) {
    // Default to the directory where this script resides.
    let path = currentScriptURL?.href ?? "";
    if (
        "publicPath" in config &&
        config.publicPath !== null &&
        config.publicPath !== undefined
    ) {
        path = config.publicPath;
    }

    // Webpack expects the paths to end with a slash.
    if (path !== "" && !path.endsWith("/")) {
        path += "/";
    }

    return path;
}

Setup.installRuffle("local", {
    onFirstLoad: () => {
        __webpack_public_path__ = publicPath(window.RufflePlayer?.config);
    },
});
