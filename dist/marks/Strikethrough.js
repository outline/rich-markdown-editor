"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_commands_1 = require("prosemirror-commands");
const markInputRule_1 = __importDefault(require("../lib/markInputRule"));
const Mark_1 = __importDefault(require("./Mark"));
class Strikethrough extends Mark_1.default {
    get name() {
        return "strikethrough";
    }
    get schema() {
        return {
            parseDOM: [
                {
                    tag: "s",
                },
                {
                    tag: "del",
                },
                {
                    tag: "strike",
                },
            ],
            toDOM: () => ["del", 0],
        };
    }
    keys({ type }) {
        return {
            "Mod-d": prosemirror_commands_1.toggleMark(type),
        };
    }
    inputRules({ type }) {
        return [markInputRule_1.default(/~([^~]+)~$/, type)];
    }
    get toMarkdown() {
        return {
            open: "~~",
            close: "~~",
            mixable: true,
            expelEnclosingWhitespace: true,
        };
    }
    get markdownToken() {
        return "s";
    }
    parseMarkdown() {
        return { mark: "strikethrough" };
    }
}
exports.default = Strikethrough;
//# sourceMappingURL=Strikethrough.js.map