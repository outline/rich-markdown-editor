import {
  splitListItem,
  sinkListItem,
  liftListItem,
} from "prosemirror-schema-list";
import { Plugin } from "prosemirror-state";
import Node from "./Node";

export default class CheckboxItem extends Node {
  get name() {
    return "checkbox_item";
  }

  get schema() {
    return {
      attrs: {
        id: {
          default: "",
        },
        checked: {
          default: false,
        },
      },
      content: "paragraph block*",
      defining: true,
      draggable: false,
      parseDOM: [
        {
          tag: `li[data-type="${this.name}"]`,
          getAttrs: dom => ({
            checked: dom.getElementsByTagName("input")[0].checked
              ? true
              : false,
          }),
        },
      ],
      toDOM: node => {
        const input = document.createElement("input");
        input.id = node.attrs.id;
        input.type = "checkbox";
        input.checked = node.attrs.checked ? true : undefined;
        input.addEventListener("click", this.handleChange);

        return [
          "li",
          {
            "data-type": this.name,
            class: node.attrs.checked ? "checked" : undefined,
          },
          [
            "span",
            {
              contentEditable: false,
            },
            input,
          ],
          ["div", 0],
        ];
      },
    };
  }

  handleChange = event => {
    const { view } = this.editor;
    const { tr } = view.state;

    const result = view.posAtCoords({
      left: event.clientX,
      top: event.clientY,
    });

    const transaction = tr.setNodeMarkup(result.inside, null, {
      checked: event.target.checked,
    });
    view.dispatch(transaction);
  };

  keys({ type }) {
    return {
      Enter: splitListItem(type),
      Tab: sinkListItem(type),
      "Shift-Tab": liftListItem(type),
      "Mod-]": sinkListItem(type),
      "Mod-[": liftListItem(type),
    };
  }

  toMarkdown(state, node) {
    state.write(node.attrs.checked ? "[x] " : "[ ] ");
    state.renderContent(node);
  }

  parseMarkdown() {
    return {
      block: "checkbox_item",
      getAttrs: tok => ({
        checked: tok.attrGet("checked") ? true : undefined,
        id: tok.attrGet("id"),
      }),
    };
  }
}
