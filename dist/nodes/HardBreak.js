"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = __importDefault(require("./Node"));
const prosemirror_tables_1 = require("prosemirror-tables");
class HardBreak extends Node_1.default {
    get name() {
        return "br";
    }
    get schema() {
        return {
            inline: true,
            group: "inline",
            selectable: false,
            parseDOM: [{ tag: "br" }],
            toDOM() {
                return ["br"];
            },
        };
    }
    commands({ type }) {
        return () => (state, dispatch) => {
            dispatch(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
            return true;
        };
    }
    keys({ type }) {
        return {
            "Shift-Enter": (state, dispatch) => {
                if (!prosemirror_tables_1.isInTable(state))
                    return false;
                dispatch(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
                return true;
            },
        };
    }
    toMarkdown(state) {
        state.write(" \\n ");
    }
    parseMarkdown() {
        return { node: "br" };
    }
}
exports.default = HardBreak;
//# sourceMappingURL=HardBreak.js.map