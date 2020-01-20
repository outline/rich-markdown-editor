// @flow
import { toggleBlockType, setBlockType } from "prosemirror-commands";
import { textblockTypeInputRule } from "prosemirror-inputrules";

import Node from "./Node";

export default class CodeBlock extends Node {
  get name() {
    return "code_block";
  }

  get schema() {
    return {
      content: "text*",
      marks: "",
      group: "block",
      code: true,
      defining: true,
      draggable: false,
      parseDOM: [{ tag: "pre", preserveWhitespace: "full" }],
      toDOM: () => ["pre", ["code", 0]],
    };
  }

  commands({ type, schema }) {
    return () => toggleBlockType(type, schema.nodes.paragraph);
  }

  keys({ type }) {
    return {
      "Shift-Ctrl-\\": setBlockType(type),
    };
  }

  inputRules({ type }) {
    return [textblockTypeInputRule(/^```$/, type)];
  }

  toMarkdown(state, node) {
    state.write("```" + (node.attrs.params || "") + "\n");
    state.text(node.textContent, false);
    state.ensureNewLine();
    state.write("```");
    state.closeBlock(node);
  }

  get markdownToken() {
    return "fence";
  }

  parseMarkdown() {
    return { block: "code_block" };
  }
}
