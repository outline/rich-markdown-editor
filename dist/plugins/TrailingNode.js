"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_state_1 = require("prosemirror-state");
const Extension_1 = __importDefault(require("../lib/Extension"));
class TrailingNode extends Extension_1.default {
    get name() {
        return "trailing_node";
    }
    get defaultOptions() {
        return {
            node: "paragraph",
            notAfter: ["paragraph", "heading"],
        };
    }
    get plugins() {
        const plugin = new prosemirror_state_1.PluginKey(this.name);
        const disabledNodes = Object.entries(this.editor.schema.nodes)
            .map(([, value]) => value)
            .filter(node => this.options.notAfter.includes(node.name));
        return [
            new prosemirror_state_1.Plugin({
                key: plugin,
                view: () => ({
                    update: view => {
                        const { state } = view;
                        const insertNodeAtEnd = plugin.getState(state);
                        if (!insertNodeAtEnd) {
                            return;
                        }
                        const { doc, schema, tr } = state;
                        const type = schema.nodes[this.options.node];
                        const transaction = tr.insert(doc.content.size, type.create());
                        view.dispatch(transaction);
                    },
                }),
                state: {
                    init: (_, state) => {
                        const lastNode = state.tr.doc.lastChild;
                        return lastNode ? !disabledNodes.includes(lastNode.type) : false;
                    },
                    apply: (tr, value) => {
                        if (!tr.docChanged) {
                            return value;
                        }
                        const lastNode = tr.doc.lastChild;
                        return lastNode ? !disabledNodes.includes(lastNode.type) : false;
                    },
                },
            }),
        ];
    }
}
exports.default = TrailingNode;
//# sourceMappingURL=TrailingNode.js.map