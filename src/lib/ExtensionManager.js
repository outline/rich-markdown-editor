// @flow
import markdownit from "markdown-it";
import { Schema } from "prosemirror-state";
import { keymap } from "prosemirror-keymap";
import { EditorView } from "prosemirror-view";
import { MarkdownSerializer, MarkdownParser } from "prosemirror-markdown";
import markPlugin from "markdown-it-mark";
import Editor from "../Editor";
import checkboxPlugin from "./markdownItCheckbox";
import breakPlugin from "./markdownBreakToParagraph";
import Extension from "./Extension";

export default class ExtensionManager {
  extensions: Extension[];

  constructor(extensions: Extension[] = [], editor: Editor) {
    extensions.forEach(extension => {
      extension.init();
      extension.bindEditor(editor);
    });
    this.extensions = extensions;
  }

  get nodes() {
    return this.extensions
      .filter(extension => extension.type === "node")
      .reduce(
        (nodes, node: { +name: string, +schema?: Object }) => ({
          ...nodes,
          [node.name]: node.schema,
        }),
        {}
      );
  }

  get serializer() {
    const nodes = this.extensions
      .filter(extension => extension.type === "node")
      .reduce(
        (marks, { name, toMarkdown }) => ({
          ...marks,
          [name]: toMarkdown,
        }),
        {}
      );

    const marks = this.extensions
      .filter(extension => extension.type === "mark")
      .reduce(
        (marks, { name, toMarkdown }) => ({
          ...marks,
          [name]: toMarkdown,
        }),
        {}
      );

    return new MarkdownSerializer(nodes, marks);
  }

  parser({ schema }) {
    const tokens = this.extensions
      .filter(
        extension => extension.type === "mark" || extension.type === "node"
      )
      .reduce((nodes, extension) => {
        const md = extension.parseMarkdown();
        if (!md) return nodes;

        return {
          ...nodes,
          [extension.markdownToken || extension.name]: md,
        };
      }, {});

    return new MarkdownParser(
      schema,
      markdownit("default", {
        breaks: false,
        html: false,
      })
        .use(breakPlugin)
        .use(checkboxPlugin)
        .use(markPlugin),
      tokens
    );
  }

  get marks() {
    return this.extensions
      .filter(extension => extension.type === "mark")
      .reduce(
        (marks, { name, schema }: { +name: string, +schema: Object }) => ({
          ...marks,
          [name]: schema,
        }),
        {}
      );
  }

  get plugins() {
    return this.extensions
      .filter(extension => extension.plugins)
      .reduce((allPlugins, { plugins }) => [...allPlugins, ...plugins], []);
  }

  keymaps({ schema }: { schema: Schema }) {
    const extensionKeymaps = this.extensions
      .filter(extension => ["extension"].includes(extension.type))
      .filter(extension => extension.keys)
      .map(extension => extension.keys({ schema }));

    const nodeMarkKeymaps = this.extensions
      .filter(extension => ["node", "mark"].includes(extension.type))
      .filter(extension => extension.keys)
      .map(extension =>
        extension.keys({
          type: schema[`${extension.type}s`][extension.name],
          schema,
        })
      );

    return [...extensionKeymaps, ...nodeMarkKeymaps].map((keys: Object) =>
      keymap(keys)
    );
  }

  inputRules({ schema }: { schema: Schema }) {
    const extensionInputRules = this.extensions
      .filter(extension => ["extension"].includes(extension.type))
      .filter(extension => extension.inputRules)
      .map(extension => extension.inputRules({ schema }));

    const nodeMarkInputRules = this.extensions
      .filter(extension => ["node", "mark"].includes(extension.type))
      .filter(extension => extension.inputRules)
      .map(extension =>
        extension.inputRules({
          type: schema[`${extension.type}s`][extension.name],
          schema,
        })
      );

    return [...extensionInputRules, ...nodeMarkInputRules].reduce(
      (allInputRules, inputRules) => [...allInputRules, ...inputRules],
      []
    );
  }

  commands({ schema, view }: { schema: Schema, view: EditorView }) {
    return this.extensions
      .filter(extension => extension.commands)
      .reduce((allCommands, extension) => {
        const { name, type } = extension;
        const commands = {};
        const value = extension.commands({
          schema,
          ...(["node", "mark"].includes(type)
            ? {
                type: schema[`${type}s`][name],
              }
            : {}),
        });

        const apply = (callback, attrs) => {
          if (!view.editable) {
            return false;
          }
          view.focus();
          return callback(attrs)(view.state, view.dispatch, view);
        };

        const handle = (_name, _value) => {
          if (Array.isArray(_value)) {
            commands[_name] = attrs =>
              _value.forEach(callback => apply(callback, attrs));
          } else if (typeof _value === "function") {
            commands[_name] = attrs => apply(_value, attrs);
          }
        };

        if (typeof value === "object") {
          Object.entries(value).forEach(([commandName, commandValue]) => {
            handle(commandName, commandValue);
          });
        } else {
          handle(name, value);
        }

        return {
          ...allCommands,
          ...commands,
        };
      }, {});
  }
}
