import { wrappingInputRule } from "prosemirror-inputrules";
import Node from "./Node";
import toggleWrap from "../commands/toggleWrap";

export default class Blockquote extends Node {
  get name() {
    return "blockquote";
  }

  get schema() {
    return {
      content: "block+",
      group: "block",
      defining: true,
      parseDOM: [{ tag: "blockquote" }],
      toDOM: () => ["blockquote", 0],
    };
  }

  inputRules({ type }) {
    return [wrappingInputRule(/^\s*>\s$/, type)];
  }

  commands({ type }) {
    return () => toggleWrap(type);
  }

  keys({ type }) {
    return {
      "Mod-]": toggleWrap(type),
    };
  }

  toMarkdown(state, node) {
    state.wrapBlock("> ", null, node, () => state.renderContent(node));
  }

  parseMarkdown() {
    return { block: "blockquote" };
  }
}
