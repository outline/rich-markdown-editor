// @flow
import { toggleMark } from "prosemirror-commands";

import Node from "./Mark";

export default class Bold extends Node {
  get name() {
    return "strong";
  }

  get schema() {
    return {
      parseDOM: [
        { tag: "b" },
        { tag: "strong" },
        { style: "font-style", getAttrs: value => value === "bold" },
      ],
      toDOM() {
        return ["strong"];
      },
    };
  }

  keys({ type }) {
    return {
      "Mod-b": toggleMark(type),
      "Mod-B": toggleMark(type),
    };
  }

  toMarkdown() {
    return {
      open: "**",
      close: "**",
      mixable: true,
      expelEnclosingWhitespace: true,
    };
  }

  parseMarkdown() {
    return { mark: "strong" };
  }
}
