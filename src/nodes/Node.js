// @flow
import Extension from "../lib/Extension";

export default class Node extends Extension {
  constructor(options: Object = {}) {
    super(options);
  }

  get type() {
    return "node";
  }

  get view() {
    return null;
  }

  get schema(): ?Object {
    return null;
  }

  toDOM() {}

  parseDOM() {}

  toMarkdown(state, node) {
    return "";
  }

  parseMarkdown() {}

  command() {
    return () => {};
  }
}
