/* eslint-disable no-unused-vars */
import Editor from "../";

type Command = (attrs) => (state, dispatch) => any;

export default class Extension {
  options: Record<string, any>;
  editor: Editor;

  constructor(options: Record<string, any> = {}) {
    this.options = {
      ...this.defaultOptions,
      ...options,
    };
  }

  bindEditor(editor: Editor) {
    this.editor = editor;
  }

  get type() {
    return "extension";
  }

  get name() {
    return "";
  }

  get plugins() {
    return [];
  }

  keys(options) {
    return {};
  }

  inputRules(options) {
    return [];
  }

  commands(options): Record<string, Command> | Command {
    return attrs => () => false;
  }

  get defaultOptions() {
    return {};
  }
}
