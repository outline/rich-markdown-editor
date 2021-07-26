"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_commands_1 = require("prosemirror-commands");
const markInputRule_1 = __importDefault(require("../lib/markInputRule"));
const Mark_1 = __importDefault(require("./Mark"));
class Italic extends Mark_1.default {
    get name() {
        return "em";
    }
    get schema() {
        return {
            parseDOM: [
                { tag: "i" },
                { tag: "em" },
                { style: "font-style", getAttrs: value => value === "italic" },
            ],
            toDOM: () => ["em"],
        };
    }
    inputRules({ type }) {
        return [
            markInputRule_1.default(/(?:^|[\s])(_([^_]+)_)$/, type),
            markInputRule_1.default(/(?:^|[^*])(\*([^*]+)\*)$/, type),
        ];
    }
    keys({ type }) {
        return {
            "Mod-i": prosemirror_commands_1.toggleMark(type),
            "Mod-I": prosemirror_commands_1.toggleMark(type),
        };
    }
    get toMarkdown() {
        return {
            open: "*",
            close: "*",
            mixable: true,
            expelEnclosingWhitespace: true,
        };
    }
    parseMarkdown() {
        return { mark: "em" };
    }
}
exports.default = Italic;
//# sourceMappingURL=Italic.js.map