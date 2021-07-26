"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_state_1 = require("prosemirror-state");
const prosemirror_tables_1 = require("prosemirror-tables");
const prosemirror_commands_1 = require("prosemirror-commands");
const Extension_1 = __importDefault(require("../lib/Extension"));
const isUrl_1 = __importDefault(require("../lib/isUrl"));
const isInCode_1 = __importDefault(require("../queries/isInCode"));
function normalizePastedMarkdown(text) {
    const CHECKBOX_REGEX = /^\s?(\[(X|\s|_|-)\]\s(.*)?)/gim;
    while (text.match(CHECKBOX_REGEX)) {
        text = text.replace(CHECKBOX_REGEX, match => `- ${match.trim()}`);
    }
    return text;
}
class MarkdownPaste extends Extension_1.default {
    get name() {
        return "markdown-paste";
    }
    get plugins() {
        return [
            new prosemirror_state_1.Plugin({
                props: {
                    handlePaste: (view, event) => {
                        if (view.props.editable && !view.props.editable(view.state)) {
                            return false;
                        }
                        if (!event.clipboardData)
                            return false;
                        const text = event.clipboardData.getData("text/plain");
                        const html = event.clipboardData.getData("text/html");
                        const { state, dispatch } = view;
                        if (isUrl_1.default(text)) {
                            if (!state.selection.empty) {
                                prosemirror_commands_1.toggleMark(this.editor.schema.marks.link, { href: text })(state, dispatch);
                                return true;
                            }
                            const { embeds } = this.editor.props;
                            if (embeds && !prosemirror_tables_1.isInTable(state)) {
                                for (const embed of embeds) {
                                    const matches = embed.matcher(text);
                                    if (matches) {
                                        this.editor.commands.embed({
                                            href: text,
                                            component: embed.component,
                                            matches,
                                        });
                                        return true;
                                    }
                                }
                            }
                            const transaction = view.state.tr
                                .insertText(text, state.selection.from, state.selection.to)
                                .addMark(state.selection.from, state.selection.to + text.length, state.schema.marks.link.create({ href: text }));
                            view.dispatch(transaction);
                            return true;
                        }
                        if (text.length === 0 || (html === null || html === void 0 ? void 0 : html.includes("data-pm-slice")) || (html === null || html === void 0 ? void 0 : html.includes("docs-internal-guid"))) {
                            return false;
                        }
                        event.preventDefault();
                        if (isInCode_1.default(view.state)) {
                            view.dispatch(view.state.tr.insertText(text));
                            return true;
                        }
                        const paste = this.editor.parser.parse(normalizePastedMarkdown(text));
                        const slice = paste.slice(0);
                        const transaction = view.state.tr.replaceSelection(slice);
                        view.dispatch(transaction);
                        return true;
                    },
                },
            }),
        ];
    }
}
exports.default = MarkdownPaste;
//# sourceMappingURL=MarkdownPaste.js.map