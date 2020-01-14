// @flow
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

  toMarkdown(state, node) {
    state.renderInline(node);
    state.closeBlock(node);
  }

  parseMarkdown() {
    return { block: "paragraph" };
  }
}
