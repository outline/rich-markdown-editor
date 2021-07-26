"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rules_1 = __importDefault(require("./markdown/rules"));
function renderToHtml(markdown) {
    return rules_1.default({ embeds: [] })
        .render(markdown)
        .trim();
}
exports.default = renderToHtml;
//# sourceMappingURL=renderToHtml.js.map