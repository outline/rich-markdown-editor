// @flow
import { Plugin } from "prosemirror-state";
import Node from "./Node";

export default class CheckboxInput extends Node {
  get name() {
    return "checkbox_input";
  }

  get schema() {
    return {
      inline: true,
      group: "inline",
      attrs: {
        checked: {
          default: null,
        },
      },
      defining: true,
      draggable: true,
      parseDOM: [
        {
          tag: "input[type=checkbox]",
          getAttrs: dom => ({
            checked: dom.checked ? true : false,
          }),
        },
      ],
      toDOM: node => [
        "input",
        {
          type: "checkbox",
          contentEditable: false,
          checked: node.attrs.checked ? true : undefined,
        },
      ],
    };
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          handleClick: (view, pos, event) => {
            if (!view.props.editable) return;
            const { tr } = view.state;

            if (
              event.target instanceof HTMLInputElement &&
              event.target.type === "checkbox"
            ) {
              const { pos } = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });
              const transaction = tr.setNodeMarkup(pos, null, {
                checked: !event.target.checked,
              });
              view.dispatch(transaction);
            }
          },
        },
      }),
    ];
  }

  toMarkdown(state, node) {
    state.write(node.attrs.checked ? "[x] " : "[ ] ");
    state.renderInline(node);
  }

  parseMarkdown() {
    return {
      node: "checkbox_input",
      getAttrs: tok => ({
        checked: tok.attrGet("checked") ? true : undefined,
      }),
    };
  }
}
