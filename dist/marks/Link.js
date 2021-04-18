"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_commands_1 = require("prosemirror-commands");
const prosemirror_state_1 = require("prosemirror-state");
const prosemirror_inputrules_1 = require("prosemirror-inputrules");
const Mark_1 = __importDefault(require("./Mark"));
const isModKey_1 = __importDefault(require("../lib/isModKey"));
const LINK_INPUT_REGEX = /\[(.+)]\((\S+)\)/;
function isPlainURL(link, parent, index, side) {
    if (link.attrs.title || !/^\w+:/.test(link.attrs.href)) {
        return false;
    }
    const content = parent.child(index + (side < 0 ? -1 : 0));
    if (!content.isText ||
        content.text !== link.attrs.href ||
        content.marks[content.marks.length - 1] !== link) {
        return false;
    }
    if (index === (side < 0 ? 1 : parent.childCount - 1)) {
        return true;
    }
    const next = parent.child(index + (side < 0 ? -2 : 1));
    return !link.isInSet(next.marks);
}
class Link extends Mark_1.default {
    get name() {
        return "link";
    }
    get schema() {
        return {
            attrs: {
                href: {
                    default: "",
                },
            },
            inclusive: false,
            parseDOM: [
                {
                    tag: "a[href]",
                    getAttrs: (dom) => ({
                        href: dom.getAttribute("href"),
                    }),
                },
            ],
            toDOM: node => [
                "a",
                Object.assign(Object.assign({}, node.attrs), { rel: "noopener noreferrer nofollow" }),
                0,
            ],
        };
    }
    inputRules({ type }) {
        return [
            new prosemirror_inputrules_1.InputRule(LINK_INPUT_REGEX, (state, match, start, end) => {
                const [okay, alt, href] = match;
                const { tr } = state;
                if (okay) {
                    tr.replaceWith(start, end, this.editor.schema.text(alt)).addMark(start, start + alt.length, type.create({ href }));
                }
                return tr;
            }),
        ];
    }
    commands({ type }) {
        return ({ href } = { href: "" }) => prosemirror_commands_1.toggleMark(type, { href });
    }
    keys({ type }) {
        return {
            "Mod-k": (state, dispatch) => {
                if (state.selection.empty) {
                    this.options.onKeyboardShortcut();
                    return true;
                }
                return prosemirror_commands_1.toggleMark(type, { href: "" })(state, dispatch);
            },
        };
    }
    get plugins() {
        return [
            new prosemirror_state_1.Plugin({
                props: {
                    handleDOMEvents: {
                        mouseover: (view, event) => {
                            if (event.target instanceof HTMLAnchorElement &&
                                !event.target.className.includes("ProseMirror-widget")) {
                                if (this.options.onHoverLink) {
                                    return this.options.onHoverLink(event);
                                }
                            }
                            return false;
                        },
                        click: (view, event) => {
                            if (view.props.editable &&
                                view.props.editable(view.state) &&
                                !isModKey_1.default(event)) {
                                return false;
                            }
                            if (event.target instanceof HTMLAnchorElement) {
                                const href = event.target.href ||
                                    (event.target.parentNode instanceof HTMLAnchorElement
                                        ? event.target.parentNode.href
                                        : "");
                                const isHashtag = href.startsWith("#");
                                if (isHashtag && this.options.onClickHashtag) {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    this.options.onClickHashtag(href, event);
                                    return true;
                                }
                                if (this.options.onClickLink) {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    this.options.onClickLink(href, event);
                                    return true;
                                }
                            }
                            return false;
                        },
                    },
                },
            }),
        ];
    }
    get toMarkdown() {
        return {
            open(_state, mark, parent, index) {
                return isPlainURL(mark, parent, index, 1) ? "<" : "[";
            },
            close(state, mark, parent, index) {
                return isPlainURL(mark, parent, index, -1)
                    ? ">"
                    : "](" +
                        state.esc(mark.attrs.href) +
                        (mark.attrs.title ? " " + state.quote(mark.attrs.title) : "") +
                        ")";
            },
        };
    }
    parseMarkdown() {
        return {
            mark: "link",
            getAttrs: tok => ({
                href: tok.attrGet("href"),
                title: tok.attrGet("title") || null,
            }),
        };
    }
}
exports.default = Link;
//# sourceMappingURL=Link.js.map