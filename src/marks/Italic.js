// @flow
import { toggleMark } from "prosemirror-commands";

import Node from "./Mark";

export default class Italic extends Node {
  get name() {
    return "em";
  }

  get schema() {
    return {
      parseDOM: [
        { tag: "i" },
        { tag: "em" },
        { style: "font-style", getAttrs: value => value === "italic" },
      ],
      toDOM() {
        return ["em"];
      },
    };
  }

  keys({ type }) {
    return {
      "Mod-i": toggleMark(type),
      "Mod-I": toggleMark(type),
    };
  }

  get toMarkdown() {
    return {
      open: "*",
      close: "*",
      mixable: true,
      expelEnclosingWhitespace: true,
    };
  }

  parseMarkdown() {
    return { mark: "em" };
  }
}
