"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_state_1 = require("prosemirror-state");
const getMarkRange_1 = __importDefault(require("../queries/getMarkRange"));
const Mark_1 = __importDefault(require("./Mark"));
class Placeholder extends Mark_1.default {
    get name() {
        return "placeholder";
    }
    get schema() {
        return {
            parseDOM: [{ tag: "span.template-placeholder" }],
            toDOM: () => ["span", { class: "template-placeholder" }],
        };
    }
    get toMarkdown() {
        return {
            open: "!!",
            close: "!!",
            mixable: true,
            expelEnclosingWhitespace: true,
        };
    }
    parseMarkdown() {
        return { mark: "placeholder" };
    }
    get plugins() {
        return [
            new prosemirror_state_1.Plugin({
                props: {
                    handleTextInput: (view, from, to, text) => {
                        if (this.editor.props.template) {
                            return false;
                        }
                        const { state, dispatch } = view;
                        const $from = state.doc.resolve(from);
                        const range = getMarkRange_1.default($from, state.schema.marks.placeholder);
                        if (!range)
                            return false;
                        const selectionStart = Math.min(from, range.from);
                        const selectionEnd = Math.max(to, range.to);
                        dispatch(state.tr
                            .removeMark(range.from, range.to, state.schema.marks.placeholder)
                            .insertText(text, selectionStart, selectionEnd));
                        const $to = view.state.doc.resolve(selectionStart + text.length);
                        dispatch(view.state.tr.setSelection(prosemirror_state_1.TextSelection.near($to)));
                        return true;
                    },
                    handleKeyDown: (view, event) => {
                        if (!view.props.editable || !view.props.editable(view.state)) {
                            return false;
                        }
                        if (this.editor.props.template) {
                            return false;
                        }
                        if (event.key !== "ArrowLeft" &&
                            event.key !== "ArrowRight" &&
                            event.key !== "Backspace") {
                            return false;
                        }
                        const { state, dispatch } = view;
                        if (event.key === "Backspace") {
                            const range = getMarkRange_1.default(state.doc.resolve(Math.max(0, state.selection.from - 1)), state.schema.marks.placeholder);
                            if (!range)
                                return false;
                            dispatch(state.tr
                                .removeMark(range.from, range.to, state.schema.marks.placeholder)
                                .insertText("", range.from, range.to));
                            return true;
                        }
                        if (event.key === "ArrowLeft") {
                            const range = getMarkRange_1.default(state.doc.resolve(Math.max(0, state.selection.from - 1)), state.schema.marks.placeholder);
                            if (!range)
                                return false;
                            const startOfMark = state.doc.resolve(range.from);
                            dispatch(state.tr.setSelection(prosemirror_state_1.TextSelection.near(startOfMark)));
                            return true;
                        }
                        if (event.key === "ArrowRight") {
                            const range = getMarkRange_1.default(state.selection.$from, state.schema.marks.placeholder);
                            if (!range)
                                return false;
                            const endOfMark = state.doc.resolve(range.to);
                            dispatch(state.tr.setSelection(prosemirror_state_1.TextSelection.near(endOfMark)));
                            return true;
                        }
                        return false;
                    },
                    handleClick: (view, pos, event) => {
                        if (!view.props.editable || !view.props.editable(view.state)) {
                            return false;
                        }
                        if (this.editor.props.template) {
                            return false;
                        }
                        if (event.target instanceof HTMLSpanElement &&
                            event.target.className.includes("template-placeholder")) {
                            const { state, dispatch } = view;
                            const range = getMarkRange_1.default(state.selection.$from, state.schema.marks.placeholder);
                            if (!range)
                                return false;
                            event.stopPropagation();
                            event.preventDefault();
                            const startOfMark = state.doc.resolve(range.from);
                            dispatch(state.tr.setSelection(prosemirror_state_1.TextSelection.near(startOfMark)));
                            return true;
                        }
                        return false;
                    },
                },
            }),
        ];
    }
}
exports.default = Placeholder;
//# sourceMappingURL=Placeholder.js.map