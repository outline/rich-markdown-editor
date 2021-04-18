"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_keymap_1 = require("prosemirror-keymap");
const prosemirror_markdown_1 = require("prosemirror-markdown");
const serializer_1 = require("./markdown/serializer");
const rules_1 = __importDefault(require("./markdown/rules"));
class ExtensionManager {
    constructor(extensions = [], editor) {
        if (editor) {
            extensions.forEach(extension => {
                extension.bindEditor(editor);
            });
        }
        this.extensions = extensions;
        this.embeds = editor ? editor.props.embeds : undefined;
    }
    get nodes() {
        return this.extensions
            .filter(extension => extension.type === "node")
            .reduce((nodes, node) => (Object.assign(Object.assign({}, nodes), { [node.name]: node.schema })), {});
    }
    serializer() {
        const nodes = this.extensions
            .filter(extension => extension.type === "node")
            .reduce((nodes, extension) => (Object.assign(Object.assign({}, nodes), { [extension.name]: extension.toMarkdown })), {});
        const marks = this.extensions
            .filter(extension => extension.type === "mark")
            .reduce((marks, extension) => (Object.assign(Object.assign({}, marks), { [extension.name]: extension.toMarkdown })), {});
        return new serializer_1.MarkdownSerializer(nodes, marks);
    }
    parser({ schema }) {
        const tokens = this.extensions
            .filter(extension => extension.type === "mark" || extension.type === "node")
            .reduce((nodes, extension) => {
            const md = extension.parseMarkdown();
            if (!md)
                return nodes;
            return Object.assign(Object.assign({}, nodes), { [extension.markdownToken || extension.name]: md });
        }, {});
        return new prosemirror_markdown_1.MarkdownParser(schema, rules_1.default({ embeds: this.embeds }), tokens);
    }
    get marks() {
        return this.extensions
            .filter(extension => extension.type === "mark")
            .reduce((marks, { name, schema }) => (Object.assign(Object.assign({}, marks), { [name]: schema })), {});
    }
    get plugins() {
        return this.extensions
            .filter(extension => extension.plugins)
            .reduce((allPlugins, { plugins }) => [...allPlugins, ...plugins], []);
    }
    keymaps({ schema }) {
        const extensionKeymaps = this.extensions
            .filter(extension => ["extension"].includes(extension.type))
            .filter(extension => extension.keys)
            .map(extension => extension.keys({ schema }));
        const nodeMarkKeymaps = this.extensions
            .filter(extension => ["node", "mark"].includes(extension.type))
            .filter(extension => extension.keys)
            .map(extension => extension.keys({
            type: schema[`${extension.type}s`][extension.name],
            schema,
        }));
        return [
            ...extensionKeymaps,
            ...nodeMarkKeymaps,
        ].map((keys) => prosemirror_keymap_1.keymap(keys));
    }
    inputRules({ schema }) {
        const extensionInputRules = this.extensions
            .filter(extension => ["extension"].includes(extension.type))
            .filter(extension => extension.inputRules)
            .map(extension => extension.inputRules({ schema }));
        const nodeMarkInputRules = this.extensions
            .filter(extension => ["node", "mark"].includes(extension.type))
            .filter(extension => extension.inputRules)
            .map(extension => extension.inputRules({
            type: schema[`${extension.type}s`][extension.name],
            schema,
        }));
        return [...extensionInputRules, ...nodeMarkInputRules].reduce((allInputRules, inputRules) => [...allInputRules, ...inputRules], []);
    }
    commands({ schema, view }) {
        return this.extensions
            .filter(extension => extension.commands)
            .reduce((allCommands, extension) => {
            const { name, type } = extension;
            const commands = {};
            const value = extension.commands(Object.assign({ schema }, (["node", "mark"].includes(type)
                ? {
                    type: schema[`${type}s`][name],
                }
                : {})));
            const apply = (callback, attrs) => {
                if (!view.editable) {
                    return false;
                }
                view.focus();
                return callback(attrs)(view.state, view.dispatch, view);
            };
            const handle = (_name, _value) => {
                if (Array.isArray(_value)) {
                    commands[_name] = attrs => _value.forEach(callback => apply(callback, attrs));
                }
                else if (typeof _value === "function") {
                    commands[_name] = attrs => apply(_value, attrs);
                }
            };
            if (typeof value === "object") {
                Object.entries(value).forEach(([commandName, commandValue]) => {
                    handle(commandName, commandValue);
                });
            }
            else {
                handle(name, value);
            }
            return Object.assign(Object.assign({}, allCommands), commands);
        }, {});
    }
}
exports.default = ExtensionManager;
//# sourceMappingURL=ExtensionManager.js.map