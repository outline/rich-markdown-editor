// @flow
import markInputRule from "../lib/markInputRule";
import Node from "./Mark";

export default class Highlight extends Node {
  get name() {
    return "mark";
  }

  get schema() {
    return {
      parseDOM: [{ tag: "mark" }],
      toDOM: () => ["mark"],
    };
  }

  inputRules({ type }) {
    return [markInputRule(/(?:==)([^=]+)(?:==)$/, type)];
  }

  get toMarkdown() {
    return {
      open: "==",
      close: "==",
      mixable: true,
      expelEnclosingWhitespace: true,
    };
  }

  parseMarkdown() {
    return { mark: "mark" };
  }
}
