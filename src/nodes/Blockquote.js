// @flow
import { wrappingInputRule } from "prosemirror-inputrules";
import Node from "./Node";

export default class Blockquote extends Node {
  get name() {
    return "blockquote";
  }

  get schema() {
    return {
      content: "block+",
      group: "block",
      parseDOM: [{ tag: "blockquote" }],
      toDOM: () => ["blockquote", 0],
    };
  }

  inputRules({ type }) {
    return [wrappingInputRule(/^\s*>\s$/, type)];
  }

  toMarkdown(state, node) {
    state.wrapBlock("> ", null, node, () => state.renderContent(node));
  }

  parseMarkdown() {
    return { block: "blockquote" };
  }
}
