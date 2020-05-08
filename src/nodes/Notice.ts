import { wrappingInputRule } from "prosemirror-inputrules";
import toggleWrap from "../commands/toggleWrap";
import Node from "./Node";

export default class Notice extends Node {
  get name() {
    return "notice";
  }

  get markdownToken() {
    return "notice";
  }

  get schema() {
    return {
      content: "block+",
      group: "block",
      defining: true,
      draggable: false,
      parseDOM: [{ tag: "div.notice-block" }],
      toDOM: () => {
        return ["div", { class: "notice-block" }, 0];
      },
    };
  }

  commands({ type }) {
    return () => toggleWrap(type);
  }

  inputRules({ type }) {
    return [wrappingInputRule(/^\$\$\$notice$/, type)];
  }

  toMarkdown(state, node) {
    state.write("\n$$$notice\n");
    state.renderContent(node);
    state.ensureNewLine();
    state.write("$$$");
    state.closeBlock(node);
  }

  parseMarkdown() {
    return {
      node: "notice",
    };
  }
}
