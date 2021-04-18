"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_inputrules_1 = require("prosemirror-inputrules");
const Node_1 = __importDefault(require("./Node"));
class HorizontalRule extends Node_1.default {
    get name() {
        return "hr";
    }
    get schema() {
        return {
            group: "block",
            parseDOM: [{ tag: "hr" }],
            toDOM() {
                return ["hr"];
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
            "Mod-_": (state, dispatch) => {
                dispatch(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
                return true;
            },
        };
    }
    inputRules({ type }) {
        return [
            new prosemirror_inputrules_1.InputRule(/^(?:---|___\s|\*\*\*\s)$/, (state, match, start, end) => {
                const { tr } = state;
                if (match[0]) {
                    tr.replaceWith(start - 1, end, type.create({}));
                }
                return tr;
            }),
        ];
    }
    toMarkdown(state, node) {
        state.write(node.attrs.markup || "\n---");
        state.closeBlock(node);
    }
    parseMarkdown() {
        return { node: "hr" };
    }
}
exports.default = HorizontalRule;
//# sourceMappingURL=HorizontalRule.js.map