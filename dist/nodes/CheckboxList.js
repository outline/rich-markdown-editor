"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_inputrules_1 = require("prosemirror-inputrules");
const toggleList_1 = __importDefault(require("../commands/toggleList"));
const Node_1 = __importDefault(require("./Node"));
class CheckboxList extends Node_1.default {
    get name() {
        return "checkbox_list";
    }
    get schema() {
        return {
            group: "block",
            content: "checkbox_item+",
            toDOM: () => ["ul", { class: this.name }, 0],
            parseDOM: [
                {
                    tag: `[class="${this.name}"]`,
                },
            ],
        };
    }
    keys({ type, schema }) {
        return {
            "Shift-Ctrl-7": toggleList_1.default(type, schema.nodes.checkbox_item),
        };
    }
    commands({ type, schema }) {
        return () => toggleList_1.default(type, schema.nodes.checkbox_item);
    }
    inputRules({ type }) {
        return [prosemirror_inputrules_1.wrappingInputRule(/^-?\s*(\[ \])\s$/i, type)];
    }
    toMarkdown(state, node) {
        state.renderList(node, "  ", () => "- ");
    }
    parseMarkdown() {
        return { block: "checkbox_list" };
    }
}
exports.default = CheckboxList;
//# sourceMappingURL=CheckboxList.js.map