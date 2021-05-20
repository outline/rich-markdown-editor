"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const markdown_it_1 = __importDefault(require("markdown-it"));
const mark_1 = __importDefault(require("./mark"));
const checkboxes_1 = __importDefault(require("./checkboxes"));
const embeds_1 = __importDefault(require("./embeds"));
const breaks_1 = __importDefault(require("./breaks"));
const tables_1 = __importDefault(require("./tables"));
const notices_1 = __importDefault(require("./notices"));
const underlines_1 = __importDefault(require("./underlines"));
const queryblock_1 = __importDefault(require("./queryblock"));
function rules({ embeds }) {
    return markdown_it_1.default("default", {
        breaks: false,
        html: false,
        linkify: true,
    })
        .use(queryblock_1.default)
        .use(embeds_1.default(embeds))
        .use(breaks_1.default)
        .use(checkboxes_1.default)
        .use(mark_1.default({ delim: "==", mark: "highlight" }))
        .use(mark_1.default({ delim: "!!", mark: "placeholder" }))
        .use(underlines_1.default)
        .use(tables_1.default)
        .use(notices_1.default);
}
exports.default = rules;
//# sourceMappingURL=rules.js.map