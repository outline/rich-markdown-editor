"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_commands_1 = require("prosemirror-commands");
const markInputRule_1 = __importDefault(require("../lib/markInputRule"));
const Mark_1 = __importDefault(require("./Mark"));
class Highlight extends Mark_1.default {
    get name() {
        return "highlight";
    }
    get schema() {
        return {
            parseDOM: [{ tag: "mark" }],
            toDOM: () => ["mark"],
        };
    }
    inputRules({ type }) {
        return [markInputRule_1.default(/(?:==)([^=]+)(?:==)$/, type)];
    }
    keys({ type }) {
        return {
            "Mod-Ctrl-h": prosemirror_commands_1.toggleMark(type),
        };
    }
    get toMarkdown() {
        return {
            open: "==",
            close: "==",
            mixable: true,
            expelEnclosingWhitespace: true,
        };
    }
    parseMarkdown() {
        return { mark: "highlight" };
    }
}
exports.default = Highlight;
//# sourceMappingURL=Highlight.js.map