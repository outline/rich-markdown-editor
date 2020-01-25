// @flow
import { EditorView } from "prosemirror-view";
import { Node } from "prosemirror-model";

export default class Extension {
  options: Object;

  constructor(options: Object = {}) {
    this.options = {
      ...this.defaultOptions,
      ...options,
    };
  }

  init() {
    return null;
  }

  bindEditor(editor) {
    this.editor = editor;
  }

  get name(): string {
    return "";
  }

  get type() {
    return "extension";
  }

  get update() {
    return (view: EditorView) => {};
  }

  get defaultOptions() {
    return {};
  }

  get plugins() {
    return [];
  }

  inputRules(node: Node) {
    return [];
  }

  pasteRules(node: Node) {
    return [];
  }

  keys(node: Node) {
    return {};
  }

  commands(node: Node) {}
}
