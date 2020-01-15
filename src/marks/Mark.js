// @flow
import Extension from "../lib/Extension";

export default class Mark extends Extension {
  constructor(options: Object = {}) {
    super(options);
  }

  get type() {
    return "mark";
  }

  get view() {
    return null;
  }

  get schema(): ?Object {
    return null;
  }

  toMarkdown() {}

  parseMarkdown() {
    return {};
  }

  command() {
    return () => {};
  }
}
