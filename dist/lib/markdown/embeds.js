"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = __importDefault(require("markdown-it/lib/token"));
function isParagraph(token) {
    return token.type === "paragraph_open";
}
function isInline(token) {
    return token.type === "inline" && token.level === 1;
}
function isLinkOpen(token) {
    return token.type === "link_open";
}
function isLinkClose(token) {
    return token.type === "link_close";
}
function default_1(embeds) {
    function isEmbed(token, link) {
        const href = link.attrs ? link.attrs[0][1] : "";
        const simpleLink = href === token.content;
        if (!simpleLink)
            return false;
        if (!embeds)
            return false;
        for (const embed of embeds) {
            const matches = embed.matcher(href);
            if (matches) {
                return Object.assign(Object.assign({}, embed), { matches });
            }
        }
    }
    return function markdownEmbeds(md) {
        md.core.ruler.after("inline", "embeds", state => {
            const tokens = state.tokens;
            let insideLink;
            for (let i = 0; i < tokens.length - 1; i++) {
                if (isInline(tokens[i]) && isParagraph(tokens[i - 1])) {
                    const tokenChildren = tokens[i].children || [];
                    for (let j = 0; j < tokenChildren.length - 1; j++) {
                        const current = tokenChildren[j];
                        if (!current)
                            continue;
                        if (isLinkOpen(current)) {
                            insideLink = current;
                            continue;
                        }
                        if (isLinkClose(current)) {
                            insideLink = null;
                            continue;
                        }
                        if (insideLink) {
                            const result = isEmbed(current, insideLink);
                            if (result) {
                                const { content } = current;
                                const token = new token_1.default("embed", "iframe", 0);
                                token.attrSet("href", content);
                                token.attrSet("matches", result.matches);
                                tokens.splice(i - 1, 3, token);
                                break;
                            }
                        }
                    }
                }
            }
            return false;
        });
    };
}
exports.default = default_1;
//# sourceMappingURL=embeds.js.map