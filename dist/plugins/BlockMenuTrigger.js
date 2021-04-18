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
const prosemirror_inputrules_1 = require("prosemirror-inputrules");
const react_dom_1 = __importDefault(require("react-dom"));
const React = __importStar(require("react"));
const prosemirror_state_1 = require("prosemirror-state");
const prosemirror_tables_1 = require("prosemirror-tables");
const prosemirror_utils_1 = require("prosemirror-utils");
const outline_icons_1 = require("outline-icons");
const prosemirror_view_1 = require("prosemirror-view");
const Extension_1 = __importDefault(require("../lib/Extension"));
const MAX_MATCH = 500;
const OPEN_REGEX = /^\/(\w+)?$/;
const CLOSE_REGEX = /(^(?!\/(\w+)?)(.*)$|^\/((\w+)\s.*|\s)$)/;
function run(view, from, to, regex, handler) {
    if (view.composing) {
        return false;
    }
    const state = view.state;
    const $from = state.doc.resolve(from);
    if ($from.parent.type.spec.code) {
        return false;
    }
    const textBefore = $from.parent.textBetween(Math.max(0, $from.parentOffset - MAX_MATCH), $from.parentOffset, null, "\ufffc");
    const match = regex.exec(textBefore);
    const tr = handler(state, match, match ? from - match[0].length : from, to);
    if (!tr)
        return false;
    return true;
}
class BlockMenuTrigger extends Extension_1.default {
    get name() {
        return "blockmenu";
    }
    get plugins() {
        const button = document.createElement("button");
        button.className = "block-menu-trigger";
        button.type = "button";
        react_dom_1.default.render(React.createElement(outline_icons_1.PlusIcon, { fill: "currentColor" }), button);
        return [
            new prosemirror_state_1.Plugin({
                props: {
                    handleClick: () => {
                        this.options.onClose();
                        return false;
                    },
                    handleKeyDown: (view, event) => {
                        if (event.key === "Backspace") {
                            setTimeout(() => {
                                const { pos } = view.state.selection.$from;
                                return run(view, pos, pos, OPEN_REGEX, (state, match) => {
                                    if (match) {
                                        this.options.onOpen(match[1]);
                                    }
                                    else {
                                        this.options.onClose();
                                    }
                                    return null;
                                });
                            });
                        }
                        if (event.key === "Enter" ||
                            event.key === "ArrowUp" ||
                            event.key === "ArrowDown" ||
                            event.key === "Tab") {
                            const { pos } = view.state.selection.$from;
                            return run(view, pos, pos, OPEN_REGEX, (state, match) => {
                                return match ? true : null;
                            });
                        }
                        return false;
                    },
                    decorations: state => {
                        const parent = prosemirror_utils_1.findParentNode(node => node.type.name === "paragraph")(state.selection);
                        if (!parent) {
                            return;
                        }
                        const decorations = [];
                        const isEmpty = parent && parent.node.content.size === 0;
                        const isSlash = parent && parent.node.textContent === "/";
                        const isTopLevel = state.selection.$from.depth === 1;
                        if (isTopLevel) {
                            if (isEmpty) {
                                decorations.push(prosemirror_view_1.Decoration.widget(parent.pos, () => {
                                    button.addEventListener("click", () => {
                                        this.options.onOpen("");
                                    });
                                    return button;
                                }));
                                decorations.push(prosemirror_view_1.Decoration.node(parent.pos, parent.pos + parent.node.nodeSize, {
                                    class: "placeholder",
                                    "data-empty-text": this.options.dictionary.newLineEmpty,
                                }));
                            }
                            if (isSlash) {
                                decorations.push(prosemirror_view_1.Decoration.node(parent.pos, parent.pos + parent.node.nodeSize, {
                                    class: "placeholder",
                                    "data-empty-text": `  ${this.options.dictionary.newLineWithSlash}`,
                                }));
                            }
                            return prosemirror_view_1.DecorationSet.create(state.doc, decorations);
                        }
                        return;
                    },
                },
            }),
        ];
    }
    inputRules() {
        return [
            new prosemirror_inputrules_1.InputRule(OPEN_REGEX, (state, match) => {
                if (match &&
                    state.selection.$from.parent.type.name === "paragraph" &&
                    !prosemirror_tables_1.isInTable(state)) {
                    this.options.onOpen(match[1]);
                }
                return null;
            }),
            new prosemirror_inputrules_1.InputRule(CLOSE_REGEX, (state, match) => {
                if (match) {
                    this.options.onClose();
                }
                return null;
            }),
        ];
    }
}
exports.default = BlockMenuTrigger;
//# sourceMappingURL=BlockMenuTrigger.js.map