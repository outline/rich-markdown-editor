"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CHECKBOX_REGEX = /\[(X|\s|_|-)\]\s(.*)?/i;
function matches(token) {
    return token && token.content.match(CHECKBOX_REGEX);
}
function isInline(token) {
    return !!token && token.type === "inline";
}
function isParagraph(token) {
    return !!token && token.type === "paragraph_open";
}
function isListItem(token) {
    return (!!token &&
        (token.type === "list_item_open" || token.type === "checkbox_item_open"));
}
function looksLikeChecklist(tokens, index) {
    return (isInline(tokens[index]) &&
        isListItem(tokens[index - 2]) &&
        isParagraph(tokens[index - 1]) &&
        matches(tokens[index]));
}
function markdownItCheckbox(md) {
    function render(tokens, idx) {
        const token = tokens[idx];
        const checked = !!token.attrGet("checked");
        if (token.nesting === 1) {
            return `<li class="checkbox-list-item"><span class="checkbox ${checked ? "checked" : ""}">${checked ? "[x]" : "[ ]"}</span>`;
        }
        else {
            return "</li>\n";
        }
    }
    md.renderer.rules.checkbox_item_open = render;
    md.renderer.rules.checkbox_item_close = render;
    md.core.ruler.after("inline", "checkboxes", state => {
        const tokens = state.tokens;
        for (let i = tokens.length - 1; i > 0; i--) {
            const matches = looksLikeChecklist(tokens, i);
            if (matches) {
                const value = matches[1];
                const checked = value.toLowerCase() === "x";
                if (tokens[i - 3].type === "bullet_list_open") {
                    tokens[i - 3].type = "checkbox_list_open";
                }
                if (tokens[i + 3].type === "bullet_list_close") {
                    tokens[i + 3].type = "checkbox_list_close";
                }
                const tokenChildren = tokens[i].children;
                if (tokenChildren) {
                    const contentMatches = tokenChildren[0].content.match(CHECKBOX_REGEX);
                    if (contentMatches) {
                        const label = contentMatches[2];
                        tokens[i].content = label;
                        tokenChildren[0].content = label;
                    }
                }
                tokens[i - 2].type = "checkbox_item_open";
                if (checked === true) {
                    tokens[i - 2].attrs = [["checked", "true"]];
                }
                let j = i;
                while (tokens[j].type !== "list_item_close") {
                    j++;
                }
                tokens[j].type = "checkbox_item_close";
            }
        }
        return false;
    });
}
exports.default = markdownItCheckbox;
//# sourceMappingURL=checkboxes.js.map