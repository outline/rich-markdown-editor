"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SSR = typeof window === "undefined";
const isMac = !SSR && window.navigator.platform === "MacIntel";
function isModKey(event) {
    return isMac ? event.metaKey : event.ctrlKey;
}
exports.default = isModKey;
//# sourceMappingURL=isModKey.js.map