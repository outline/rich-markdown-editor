"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_state_1 = require("prosemirror-state");
const prosemirror_view_1 = require("prosemirror-view");
const Extension_1 = __importDefault(require("../lib/Extension"));
const prosemirror_utils_1 = require("prosemirror-utils");
const headingToSlug_1 = require("../lib/headingToSlug");
class Folding extends Extension_1.default {
    get name() {
        return "folding";
    }
    get plugins() {
        let loaded = false;
        return [
            new prosemirror_state_1.Plugin({
                view: view => {
                    view.dispatch(view.state.tr.setMeta("folding", { loaded: true }));
                    return {};
                },
                appendTransaction: (transactions, oldState, newState) => {
                    if (loaded)
                        return;
                    if (!transactions.some(transaction => transaction.getMeta("folding"))) {
                        return;
                    }
                    let modified = false;
                    const tr = newState.tr;
                    const blocks = prosemirror_utils_1.findBlockNodes(newState.doc);
                    for (const block of blocks) {
                        if (block.node.type.name === "heading") {
                            const persistKey = headingToSlug_1.headingToPersistenceKey(block.node, this.editor.props.id);
                            const persistedState = localStorage === null || localStorage === void 0 ? void 0 : localStorage.getItem(persistKey);
                            if (persistedState === "collapsed") {
                                tr.setNodeMarkup(block.pos, undefined, Object.assign(Object.assign({}, block.node.attrs), { collapsed: true }));
                                modified = true;
                            }
                        }
                    }
                    loaded = true;
                    return modified ? tr : null;
                },
                props: {
                    decorations: state => {
                        const { doc } = state;
                        const decorations = [];
                        const blocks = prosemirror_utils_1.findBlockNodes(doc);
                        let withinCollapsedHeading;
                        for (const block of blocks) {
                            if (block.node.type.name === "heading") {
                                if (!withinCollapsedHeading ||
                                    block.node.attrs.level <= withinCollapsedHeading) {
                                    if (block.node.attrs.collapsed) {
                                        if (!withinCollapsedHeading) {
                                            withinCollapsedHeading = block.node.attrs.level;
                                        }
                                    }
                                    else {
                                        withinCollapsedHeading = undefined;
                                    }
                                    continue;
                                }
                            }
                            if (withinCollapsedHeading) {
                                decorations.push(prosemirror_view_1.Decoration.node(block.pos, block.pos + block.node.nodeSize, {
                                    class: "folded-content",
                                }));
                            }
                        }
                        return prosemirror_view_1.DecorationSet.create(doc, decorations);
                    },
                },
            }),
        ];
    }
}
exports.default = Folding;
//# sourceMappingURL=Folding.js.map