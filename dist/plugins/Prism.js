"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LANGUAGES = void 0;
const core_1 = __importDefault(require("refractor/core"));
const flattenDeep_1 = __importDefault(require("lodash/flattenDeep"));
const prosemirror_state_1 = require("prosemirror-state");
const prosemirror_view_1 = require("prosemirror-view");
const prosemirror_utils_1 = require("prosemirror-utils");
exports.LANGUAGES = {
    none: "None",
    bash: "Bash",
    css: "CSS",
    clike: "C",
    csharp: "C#",
    go: "Go",
    markup: "HTML",
    java: "Java",
    javascript: "JavaScript",
    json: "JSON",
    php: "PHP",
    powershell: "Powershell",
    python: "Python",
    ruby: "Ruby",
    sql: "SQL",
    typescript: "TypeScript",
    yaml: "YAML",
};
const cache = {};
function getDecorations({ doc, name }) {
    const decorations = [];
    const blocks = prosemirror_utils_1.findBlockNodes(doc).filter(item => item.node.type.name === name);
    function parseNodes(nodes, classNames = []) {
        return nodes.map(node => {
            if (node.type === "element") {
                const classes = [...classNames, ...(node.properties.className || [])];
                return parseNodes(node.children, classes);
            }
            return {
                text: node.value,
                classes: classNames,
            };
        });
    }
    blocks.forEach(block => {
        let startPos = block.pos + 1;
        const language = block.node.attrs.language;
        if (!language || language === "none" || !core_1.default.registered(language)) {
            return;
        }
        if (!cache[block.pos] || !cache[block.pos].node.eq(block.node)) {
            const nodes = core_1.default.highlight(block.node.textContent, language);
            const _decorations = flattenDeep_1.default(parseNodes(nodes))
                .map((node) => {
                const from = startPos;
                const to = from + node.text.length;
                startPos = to;
                return Object.assign(Object.assign({}, node), { from,
                    to });
            })
                .map(node => {
                return prosemirror_view_1.Decoration.inline(node.from, node.to, {
                    class: (node.classes || []).join(" "),
                });
            });
            cache[block.pos] = {
                node: block.node,
                decorations: _decorations,
            };
        }
        cache[block.pos].decorations.forEach(decoration => {
            decorations.push(decoration);
        });
    });
    Object.keys(cache)
        .filter(pos => !blocks.find(block => block.pos === Number(pos)))
        .forEach(pos => {
        delete cache[Number(pos)];
    });
    return prosemirror_view_1.DecorationSet.create(doc, decorations);
}
function Prism({ name }) {
    let highlighted = false;
    return new prosemirror_state_1.Plugin({
        key: new prosemirror_state_1.PluginKey("prism"),
        state: {
            init: (_, { doc }) => {
                return prosemirror_view_1.DecorationSet.create(doc, []);
            },
            apply: (transaction, decorationSet, oldState, state) => {
                const nodeName = state.selection.$head.parent.type.name;
                const previousNodeName = oldState.selection.$head.parent.type.name;
                const codeBlockChanged = transaction.docChanged && [nodeName, previousNodeName].includes(name);
                if (!highlighted || codeBlockChanged) {
                    highlighted = true;
                    return getDecorations({ doc: transaction.doc, name });
                }
                return decorationSet.map(transaction.mapping, transaction.doc);
            },
        },
        view: view => {
            if (!highlighted) {
                setTimeout(() => {
                    view.dispatch(view.state.tr.setMeta("prism", { loaded: true }));
                }, 10);
            }
            return {};
        },
        props: {
            decorations(state) {
                return this.getState(state);
            },
        },
    });
}
exports.default = Prism;
//# sourceMappingURL=Prism.js.map