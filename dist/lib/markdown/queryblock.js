"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const markdown_it_container_1 = __importDefault(require("markdown-it-container"));
function queryblock(md) {
    return markdown_it_container_1.default(md, "query_block", {
        marker: ";",
        validate: () => true,
        render: function (tokens, idx) {
            console.log("QUERYBLOCK TOKENS: ", tokens);
            if (tokens[idx].nesting === 1) {
                return `<div class="queryblock">\n`;
            }
            else {
                return "</div>\n";
            }
        },
    });
}
exports.default = queryblock;
//# sourceMappingURL=queryblock.js.map