// @flow
import { setBlockType } from "prosemirror-commands";
import Node from "./Node";

export default class Paragraph extends Node {
  get name() {
    return "paragraph";
  }

  get schema() {
    return {
      content: "inline*",
      group: "block",
      parseDOM: [{ tag: "p" }],
      toDOM() {
        return ["p", 0];
      },
    };
  }

  keys({ type }) {
    return {
      "Shift-Ctrl-0": setBlockType(type),
    };
  }

  toMarkdown(state, node) {
    if (node.textContent.trim() === "") {
      state.write("\\\n");
    } else {
      state.renderInline(node);
      state.closeBlock(node);
    }
  }

  parseMarkdown() {
    return { block: "paragraph" };
  }
}
