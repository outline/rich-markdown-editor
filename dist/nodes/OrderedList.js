"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_inputrules_1 = require("prosemirror-inputrules");
const toggleList_1 = __importDefault(require("../commands/toggleList"));
const Node_1 = __importDefault(require("./Node"));
class OrderedList extends Node_1.default {
    get name() {
        return "ordered_list";
    }
    get schema() {
        return {
            attrs: {
                order: {
                    default: 1,
                },
            },
            content: "list_item+",
            group: "block",
            parseDOM: [
                {
                    tag: "ol",
                    getAttrs: (dom) => ({
                        order: dom.hasAttribute("start")
                            ? parseInt(dom.getAttribute("start") || "1", 10)
                            : 1,
                    }),
                },
            ],
            toDOM: node => node.attrs.order === 1
                ? ["ol", 0]
                : ["ol", { start: node.attrs.order }, 0],
        };
    }
    commands({ type, schema }) {
        return () => toggleList_1.default(type, schema.nodes.list_item);
    }
    keys({ type, schema }) {
        return {
            "Shift-Ctrl-9": toggleList_1.default(type, schema.nodes.list_item),
        };
    }
    inputRules({ type }) {
        return [
            prosemirror_inputrules_1.wrappingInputRule(/^(\d+)\.\s$/, type, match => ({ order: +match[1] }), (match, node) => node.childCount + node.attrs.order === +match[1]),
        ];
    }
    toMarkdown(state, node) {
        const start = node.attrs.order || 1;
        const maxW = `${start + node.childCount - 1}`.length;
        const space = state.repeat(" ", maxW + 2);
        state.renderList(node, space, i => {
            const nStr = `${start + i}`;
            return state.repeat(" ", maxW - nStr.length) + nStr + ". ";
        });
    }
    parseMarkdown() {
        return { block: "ordered_list" };
    }
}
exports.default = OrderedList;
//# sourceMappingURL=OrderedList.js.map