"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_commands_1 = require("prosemirror-commands");
const Node_1 = __importDefault(require("./Node"));
class Paragraph extends Node_1.default {
    get name() {
        return "paragraph";
    }
    get schema() {
        return {
            content: "inline*",
            group: "block",
            parseDOM: [{ tag: "p" }],
            toDOM: () => ["p", 0],
        };
    }
    keys({ type }) {
        return {
            "Shift-Ctrl-0": prosemirror_commands_1.setBlockType(type),
        };
    }
    commands({ type }) {
        return () => prosemirror_commands_1.setBlockType(type);
    }
    toMarkdown(state, node) {
        if (node.textContent.trim() === "" &&
            node.childCount === 0 &&
            !state.inTable) {
            state.write("\\\n");
        }
        else {
            state.renderInline(node);
            state.closeBlock(node);
        }
    }
    parseMarkdown() {
        return { block: "paragraph" };
    }
}
exports.default = Paragraph;
//# sourceMappingURL=Paragraph.js.map