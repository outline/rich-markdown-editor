"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_inputrules_1 = require("prosemirror-inputrules");
const prosemirror_history_1 = require("prosemirror-history");
const Extension_1 = __importDefault(require("../lib/Extension"));
class History extends Extension_1.default {
    get name() {
        return "history";
    }
    keys() {
        return {
            "Mod-z": prosemirror_history_1.undo,
            "Mod-y": prosemirror_history_1.redo,
            "Shift-Mod-z": prosemirror_history_1.redo,
            Backspace: prosemirror_inputrules_1.undoInputRule,
        };
    }
    get plugins() {
        return [prosemirror_history_1.history()];
    }
}
exports.default = History;
//# sourceMappingURL=History.js.map