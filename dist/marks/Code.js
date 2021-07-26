"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_commands_1 = require("prosemirror-commands");
const markInputRule_1 = __importDefault(require("../lib/markInputRule"));
const moveLeft_1 = __importDefault(require("../commands/moveLeft"));
const moveRight_1 = __importDefault(require("../commands/moveRight"));
const Mark_1 = __importDefault(require("./Mark"));
function backticksFor(node, side) {
    const ticks = /`+/g;
    let match;
    let len = 0;
    if (node.isText) {
        while ((match = ticks.exec(node.text))) {
            len = Math.max(len, match[0].length);
        }
    }
    let result = len > 0 && side > 0 ? " `" : "`";
    for (let i = 0; i < len; i++) {
        result += "`";
    }
    if (len > 0 && side < 0) {
        result += " ";
    }
    return result;
}
class Code extends Mark_1.default {
    get name() {
        return "code_inline";
    }
    get schema() {
        return {
            excludes: "_",
            parseDOM: [{ tag: "code", preserveWhitespace: true }],
            toDOM: () => ["code", { spellCheck: false }],
        };
    }
    inputRules({ type }) {
        return [markInputRule_1.default(/(?:^|[^`])(`([^`]+)`)$/, type)];
    }
    keys({ type }) {
        return {
            "Mod`": prosemirror_commands_1.toggleMark(type),
            ArrowLeft: moveLeft_1.default(),
            ArrowRight: moveRight_1.default(),
        };
    }
    get toMarkdown() {
        return {
            open(_state, _mark, parent, index) {
                return backticksFor(parent.child(index), -1);
            },
            close(_state, _mark, parent, index) {
                return backticksFor(parent.child(index - 1), 1);
            },
            escape: false,
        };
    }
    parseMarkdown() {
        return { mark: "code_inline" };
    }
}
exports.default = Code;
//# sourceMappingURL=Code.js.map