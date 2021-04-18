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
const core_1 = __importDefault(require("refractor/core"));
const bash_1 = __importDefault(require("refractor/lang/bash"));
const css_1 = __importDefault(require("refractor/lang/css"));
const clike_1 = __importDefault(require("refractor/lang/clike"));
const csharp_1 = __importDefault(require("refractor/lang/csharp"));
const go_1 = __importDefault(require("refractor/lang/go"));
const java_1 = __importDefault(require("refractor/lang/java"));
const javascript_1 = __importDefault(require("refractor/lang/javascript"));
const json_1 = __importDefault(require("refractor/lang/json"));
const markup_1 = __importDefault(require("refractor/lang/markup"));
const php_1 = __importDefault(require("refractor/lang/php"));
const python_1 = __importDefault(require("refractor/lang/python"));
const powershell_1 = __importDefault(require("refractor/lang/powershell"));
const ruby_1 = __importDefault(require("refractor/lang/ruby"));
const sql_1 = __importDefault(require("refractor/lang/sql"));
const typescript_1 = __importDefault(require("refractor/lang/typescript"));
const yaml_1 = __importDefault(require("refractor/lang/yaml"));
const prosemirror_commands_1 = require("prosemirror-commands");
const prosemirror_inputrules_1 = require("prosemirror-inputrules");
const copy_to_clipboard_1 = __importDefault(require("copy-to-clipboard"));
const Prism_1 = __importStar(require("../plugins/Prism"));
const isInCode_1 = __importDefault(require("../queries/isInCode"));
const Node_1 = __importDefault(require("./Node"));
const types_1 = require("../types");
[
    bash_1.default,
    css_1.default,
    clike_1.default,
    csharp_1.default,
    go_1.default,
    java_1.default,
    javascript_1.default,
    json_1.default,
    markup_1.default,
    php_1.default,
    python_1.default,
    powershell_1.default,
    ruby_1.default,
    sql_1.default,
    typescript_1.default,
    yaml_1.default,
].forEach(core_1.default.register);
class CodeFence extends Node_1.default {
    constructor() {
        super(...arguments);
        this.handleCopyToClipboard = event => {
            const { view } = this.editor;
            const element = event.target;
            const { top, left } = element.getBoundingClientRect();
            const result = view.posAtCoords({ top, left });
            if (result) {
                const node = view.state.doc.nodeAt(result.pos);
                if (node) {
                    copy_to_clipboard_1.default(node.textContent);
                    if (this.options.onShowToast) {
                        this.options.onShowToast(this.options.dictionary.codeCopied, types_1.ToastType.Info);
                    }
                }
            }
        };
        this.handleLanguageChange = event => {
            const { view } = this.editor;
            const { tr } = view.state;
            const element = event.target;
            const { top, left } = element.getBoundingClientRect();
            const result = view.posAtCoords({ top, left });
            if (result) {
                const transaction = tr.setNodeMarkup(result.inside, undefined, {
                    language: element.value,
                });
                view.dispatch(transaction);
            }
        };
    }
    get languageOptions() {
        return Object.entries(Prism_1.LANGUAGES);
    }
    get name() {
        return "code_fence";
    }
    get schema() {
        return {
            attrs: {
                language: {
                    default: "javascript",
                },
            },
            content: "text*",
            marks: "",
            group: "block",
            code: true,
            defining: true,
            draggable: false,
            parseDOM: [
                { tag: "pre", preserveWhitespace: "full" },
                {
                    tag: ".code-block",
                    preserveWhitespace: "full",
                    contentElement: "code",
                    getAttrs: (dom) => {
                        return {
                            language: dom.dataset.language,
                        };
                    },
                },
            ],
            toDOM: node => {
                const button = document.createElement("button");
                button.innerText = "Copy";
                button.type = "button";
                button.addEventListener("click", this.handleCopyToClipboard);
                const select = document.createElement("select");
                select.addEventListener("change", this.handleLanguageChange);
                this.languageOptions.forEach(([key, label]) => {
                    const option = document.createElement("option");
                    const value = key === "none" ? "" : key;
                    option.value = value;
                    option.innerText = label;
                    option.selected = node.attrs.language === value;
                    select.appendChild(option);
                });
                return [
                    "div",
                    { class: "code-block", "data-language": node.attrs.language },
                    ["div", { contentEditable: false }, select, button],
                    ["pre", ["code", { spellCheck: false }, 0]],
                ];
            },
        };
    }
    commands({ type }) {
        return () => prosemirror_commands_1.setBlockType(type);
    }
    keys({ type }) {
        return {
            "Shift-Ctrl-\\": prosemirror_commands_1.setBlockType(type),
            "Shift-Enter": (state, dispatch) => {
                if (!isInCode_1.default(state))
                    return false;
                const { tr, selection } = state;
                dispatch(tr.insertText("\n", selection.from, selection.to));
                return true;
            },
            Tab: (state, dispatch) => {
                if (!isInCode_1.default(state))
                    return false;
                const { tr, selection } = state;
                dispatch(tr.insertText("  ", selection.from, selection.to));
                return true;
            },
        };
    }
    get plugins() {
        return [Prism_1.default({ name: this.name })];
    }
    inputRules({ type }) {
        return [prosemirror_inputrules_1.textblockTypeInputRule(/^```$/, type)];
    }
    toMarkdown(state, node) {
        state.write("```" + (node.attrs.language || "") + "\n");
        state.text(node.textContent, false);
        state.ensureNewLine();
        state.write("```");
        state.closeBlock(node);
    }
    get markdownToken() {
        return "fence";
    }
    parseMarkdown() {
        return {
            block: "code_block",
            getAttrs: tok => ({ language: tok.info }),
        };
    }
}
exports.default = CodeFence;
//# sourceMappingURL=CodeFence.js.map