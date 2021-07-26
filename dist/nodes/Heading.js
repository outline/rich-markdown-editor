"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_state_1 = require("prosemirror-state");
const copy_to_clipboard_1 = __importDefault(require("copy-to-clipboard"));
const prosemirror_view_1 = require("prosemirror-view");
const prosemirror_inputrules_1 = require("prosemirror-inputrules");
const prosemirror_commands_1 = require("prosemirror-commands");
const backspaceToParagraph_1 = __importDefault(require("../commands/backspaceToParagraph"));
const toggleBlockType_1 = __importDefault(require("../commands/toggleBlockType"));
const headingToSlug_1 = __importStar(require("../lib/headingToSlug"));
const Node_1 = __importDefault(require("./Node"));
const types_1 = require("../types");
class Heading extends Node_1.default {
    constructor() {
        super(...arguments);
        this.className = "heading-name";
        this.handleFoldContent = event => {
            event.preventDefault();
            const { view } = this.editor;
            const { tr } = view.state;
            const { top, left } = event.target.getBoundingClientRect();
            const result = view.posAtCoords({ top, left });
            if (result) {
                const node = view.state.doc.nodeAt(result.inside);
                if (node) {
                    const collapsed = !node.attrs.collapsed;
                    const transaction = tr.setNodeMarkup(result.inside, undefined, Object.assign(Object.assign({}, node.attrs), { collapsed }));
                    const persistKey = headingToSlug_1.headingToPersistenceKey(node, this.editor.props.id);
                    if (collapsed) {
                        localStorage === null || localStorage === void 0 ? void 0 : localStorage.setItem(persistKey, "collapsed");
                    }
                    else {
                        localStorage === null || localStorage === void 0 ? void 0 : localStorage.removeItem(persistKey);
                    }
                    view.dispatch(transaction);
                }
            }
        };
        this.handleCopyLink = event => {
            const anchor = event.currentTarget.parentNode.parentNode.previousSibling;
            if (!anchor.className.includes(this.className)) {
                throw new Error("Did not find anchor as previous sibling of heading");
            }
            const hash = `#${anchor.id}`;
            const urlWithoutHash = window.location.href.split("#")[0];
            copy_to_clipboard_1.default(urlWithoutHash + hash);
            if (this.options.onShowToast) {
                this.options.onShowToast(this.options.dictionary.linkCopied, types_1.ToastType.Info);
            }
        };
    }
    get name() {
        return "heading";
    }
    get defaultOptions() {
        return {
            levels: [1, 2, 3, 4],
            collapsed: undefined,
        };
    }
    get schema() {
        return {
            attrs: {
                level: {
                    default: 1,
                },
                collapsed: {
                    default: undefined,
                },
            },
            content: "inline*",
            group: "block",
            defining: true,
            draggable: false,
            parseDOM: this.options.levels.map(level => ({
                tag: `h${level}`,
                attrs: { level },
                contentElement: "span",
            })),
            toDOM: node => {
                const anchor = document.createElement("button");
                anchor.innerText = "#";
                anchor.type = "button";
                anchor.className = "heading-anchor";
                anchor.contentEditable = "false";
                anchor.addEventListener("click", event => this.handleCopyLink(event));
                const fold = document.createElement("button");
                fold.innerText = "";
                fold.innerHTML =
                    '<svg fill="currentColor" width="12" height="24" viewBox="6 0 12 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.23823905,10.6097108 L11.207376,14.4695888 L11.207376,14.4695888 C11.54411,14.907343 12.1719566,14.989236 12.6097108,14.652502 C12.6783439,14.5997073 12.7398293,14.538222 12.792624,14.4695888 L15.761761,10.6097108 L15.761761,10.6097108 C16.0984949,10.1719566 16.0166019,9.54410997 15.5788477,9.20737601 C15.4040391,9.07290785 15.1896811,9 14.969137,9 L9.03086304,9 L9.03086304,9 C8.47857829,9 8.03086304,9.44771525 8.03086304,10 C8.03086304,10.2205442 8.10377089,10.4349022 8.23823905,10.6097108 Z" /></svg>';
                fold.type = "button";
                fold.className = `heading-fold ${node.attrs.collapsed ? "collapsed" : ""}`;
                fold.contentEditable = "false";
                fold.addEventListener("click", event => this.handleFoldContent(event));
                return [
                    `h${node.attrs.level + (this.options.offset || 0)}`,
                    [
                        "span",
                        {
                            class: `heading-actions ${node.attrs.collapsed ? "collapsed" : ""}`,
                        },
                        anchor,
                        fold,
                    ],
                    [
                        "span",
                        {
                            class: "heading-content",
                        },
                        0,
                    ],
                ];
            },
        };
    }
    toMarkdown(state, node) {
        state.write(state.repeat("#", node.attrs.level) + " ");
        state.renderInline(node);
        state.closeBlock(node);
    }
    parseMarkdown() {
        return {
            block: "heading",
            getAttrs: (token) => ({
                level: +token.tag.slice(1),
            }),
        };
    }
    commands({ type, schema }) {
        return (attrs) => {
            return toggleBlockType_1.default(type, schema.nodes.paragraph, attrs);
        };
    }
    keys({ type }) {
        const options = this.options.levels.reduce((items, level) => (Object.assign(Object.assign({}, items), {
            [`Shift-Ctrl-${level}`]: prosemirror_commands_1.setBlockType(type, { level }),
        })), {});
        return Object.assign(Object.assign({}, options), { Backspace: backspaceToParagraph_1.default(type) });
    }
    get plugins() {
        const getAnchors = doc => {
            const decorations = [];
            const previouslySeen = {};
            doc.descendants((node, pos) => {
                if (node.type.name !== this.name)
                    return;
                const slug = headingToSlug_1.default(node);
                let id = slug;
                if (previouslySeen[slug] > 0) {
                    id = headingToSlug_1.default(node, previouslySeen[slug]);
                }
                previouslySeen[slug] =
                    previouslySeen[slug] !== undefined ? previouslySeen[slug] + 1 : 1;
                decorations.push(prosemirror_view_1.Decoration.widget(pos, () => {
                    const anchor = document.createElement("a");
                    anchor.id = id;
                    anchor.className = this.className;
                    return anchor;
                }, {
                    side: -1,
                    key: id,
                }));
            });
            return prosemirror_view_1.DecorationSet.create(doc, decorations);
        };
        const plugin = new prosemirror_state_1.Plugin({
            state: {
                init: (config, state) => {
                    return getAnchors(state.doc);
                },
                apply: (tr, oldState) => {
                    return tr.docChanged ? getAnchors(tr.doc) : oldState;
                },
            },
            props: {
                decorations: state => plugin.getState(state),
            },
        });
        return [plugin];
    }
    inputRules({ type }) {
        return this.options.levels.map(level => prosemirror_inputrules_1.textblockTypeInputRule(new RegExp(`^(#{1,${level}})\\s$`), type, () => ({
            level,
        })));
    }
}
exports.default = Heading;
//# sourceMappingURL=Heading.js.map