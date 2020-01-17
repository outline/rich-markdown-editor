// @flow
import Extension from "../lib/Extension";

export default class Node extends Extension {
  constructor(options: Object = {}) {
    super(options);
  }

  get type() {
    return "node";
  }

  get schema(): ?Object {
    return null;
  }

  toMarkdown() {}

  parseMarkdown(): Object {}

  command() {
    return () => {};
  }
}
