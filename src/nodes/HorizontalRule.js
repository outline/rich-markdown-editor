// @flow
import { InputRule } from "prosemirror-inputrules";
import Node from "./Node";

export default class HorizontalRule extends Node {
  get name() {
    return "horizontal_rule";
  }

  get schema() {
    return {
      group: "block",
      parseDOM: [{ tag: "hr" }],
      toDOM() {
        return ["div", ["hr"]];
      },
    };
  }

  inputRules({ type }) {
    return [
      new InputRule(/^(?:---|___\s|\*\*\*\s)$/, (state, match, start, end) => {
        const { tr } = state;

        if (match[0]) {
          tr.replaceWith(start - 1, end, type.create({}));
        }

        return tr;
      }),
    ];
  }

  toMarkdown(state, node) {
    state.write(node.attrs.markup || "---");
    state.closeBlock(node);
  }

  parseMarkdown() {
    return { block: "horizontal_rule" };
  }
}
