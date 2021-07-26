"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isUrl(text) {
    if (text.match(/\n/)) {
        return false;
    }
    try {
        const url = new URL(text);
        return url.hostname !== "";
    }
    catch (err) {
        return false;
    }
}
exports.default = isUrl;
//# sourceMappingURL=isUrl.js.map