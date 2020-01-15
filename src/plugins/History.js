// @flow
import { history, undo, redo } from "prosemirror-history";
import Extension from "../lib/Extension";

export default class History extends Extension {
  get name() {
    return "history";
  }

  keys() {
    return {
      "Mod-z": undo,
      "Mod-y": redo,
      "Shift-Mod-z": redo,
    };
  }

  get plugins() {
    return [history()];
  }
}
