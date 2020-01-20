// @flow
import Node from "./Node";

export default class Checkbox extends Node {
  get name() {
    return "checkbox";
  }

  get schema() {
    return {
      content: "checkbox_input text*",
      defining: true,
      draggable: true,
      parseDOM: [{ tag: "div[checkbox]" }],
      toDOM: () => ["div", 0],
    };
  }

  toMarkdown(state, node) {
    state.renderContent(node);
  }

  parseMarkdown() {
    return { block: "checkbox" };
  }
}
