"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_commands_1 = require("prosemirror-commands");
const Extension_1 = __importDefault(require("../lib/Extension"));
class Mark extends Extension_1.default {
    get type() {
        return "mark";
    }
    get markdownToken() {
        return "";
    }
    get toMarkdown() {
        return {};
    }
    parseMarkdown() {
        return {};
    }
    commands({ type }) {
        return () => prosemirror_commands_1.toggleMark(type);
    }
}
exports.default = Mark;
//# sourceMappingURL=Mark.js.map