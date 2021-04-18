"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = __importDefault(require("./Node"));
class TableRow extends Node_1.default {
    get name() {
        return "tr";
    }
    get schema() {
        return {
            content: "(th | td)*",
            tableRole: "row",
            parseDOM: [{ tag: "tr" }],
            toDOM() {
                return ["tr", 0];
            },
        };
    }
    parseMarkdown() {
        return { block: "tr" };
    }
}
exports.default = TableRow;
//# sourceMappingURL=TableRow.js.map