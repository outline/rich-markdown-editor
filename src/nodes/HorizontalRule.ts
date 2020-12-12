import { InputRule } from "prosemirror-inputrules";
import Node from "./Node";

export default class HorizontalRule extends Node {
  get name() {
    return "hr";
  }

  get schema() {
    return {
      group: "block",
      parseDOM: [{ tag: "hr" }],
      toDOM() {
        return ["hr"];
      },
    };
  }

  commands({ type }) {
    return () => (state, dispatch) => {
      dispatch(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
      return true;
    };
  }

  keys({ type }) {
    return {
      "Mod-_": (state, dispatch) => {
        dispatch(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
        return true;
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
    state.write(node.attrs.markup || "\n---");
    state.closeBlock(node);
  }

  parseMarkdown() {
    return { node: "hr" };
  }
}
