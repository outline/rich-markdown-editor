// @flow
import { history, undo, redo } from "prosemirror-history";
import Extension from "../lib/Extension";

export default class History extends Extension {
  get name() {
    return "history";
  }

  keys() {
    const keymap = {
      "Mod-z": undo,
      "Mod-y": redo,
      "Shift-Mod-z": redo,
    };

    return keymap;
  }

  get plugins() {
    return [history()];
  }
}
