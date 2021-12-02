/* eslint-disable @typescript-eslint/no-unused-vars */
import { InputRule } from "prosemirror-inputrules";
import { Plugin } from "prosemirror-state";
import Editor from "../";
import { PluginSimple } from "markdown-it";
import { MenuItem } from "../types";

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

  get plugins(): Plugin[] {
    return [];
  }

  get rulePlugins(): PluginSimple[] {
    return [];
  }

  keys(options) {
    return {};
  }

  inputRules(options): InputRule[] {
    return [];
  }

  commands(options): Record<string, Command> | Command {
    return attrs => () => false;
  }

  get menuItems(): MenuItem[] {
    return [];
  }

  get defaultOptions() {
    return {};
  }
}
