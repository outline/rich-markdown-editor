"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = __importDefault(require("markdown-it/lib/token"));
const BREAK_REGEX = /(?:^|[^\\])\\n/;
function markdownTables(md) {
    md.core.ruler.after("inline", "tables-pm", state => {
        const tokens = state.tokens;
        let inside = false;
        for (let i = tokens.length - 1; i > 0; i--) {
            if (inside) {
                tokens[i].level--;
            }
            if (tokens[i].type === "inline" && tokens[i].content.match(BREAK_REGEX)) {
                const existing = tokens[i].children || [];
                tokens[i].children = [];
                existing.forEach(child => {
                    var _a;
                    const breakParts = child.content.split(BREAK_REGEX);
                    if (breakParts.length > 1 && child.type !== "code_inline") {
                        breakParts.forEach((part, index) => {
                            var _a, _b;
                            const token = new token_1.default("text", "", 1);
                            token.content = part.trim();
                            (_a = tokens[i].children) === null || _a === void 0 ? void 0 : _a.push(token);
                            if (index < breakParts.length - 1) {
                                const brToken = new token_1.default("br", "br", 1);
                                (_b = tokens[i].children) === null || _b === void 0 ? void 0 : _b.push(brToken);
                            }
                        });
                    }
                    else {
                        (_a = tokens[i].children) === null || _a === void 0 ? void 0 : _a.push(child);
                    }
                });
            }
            if (["thead_open", "thead_close", "tbody_open", "tbody_close"].includes(tokens[i].type)) {
                inside = !inside;
                tokens.splice(i, 1);
            }
            if (["th_open", "td_open"].includes(tokens[i].type)) {
                tokens.splice(i + 1, 0, new token_1.default("paragraph_open", "p", 1));
                const tokenAttrs = tokens[i].attrs;
                if (tokenAttrs) {
                    const style = tokenAttrs[0][1];
                    tokens[i].info = style.split(":")[1];
                }
            }
            if (["th_close", "td_close"].includes(tokens[i].type)) {
                tokens.splice(i, 0, new token_1.default("paragraph_close", "p", -1));
            }
        }
        return false;
    });
}
exports.default = markdownTables;
//# sourceMappingURL=tables.js.map