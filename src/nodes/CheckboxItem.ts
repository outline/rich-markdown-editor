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
      toDOM: node => [
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
          [
            "input",
            {
              id: node.attrs.id,
              type: "checkbox",
              checked: node.attrs.checked ? true : undefined,
            },
          ],
        ],
        ["div", 0],
      ],
    };
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          handleClick: (view, pos, event) => {
            if (!view.props.editable) return false;
            const { tr } = view.state;

            if (
              event.target instanceof HTMLInputElement &&
              event.target.type === "checkbox"
            ) {
              event.preventDefault();
              event.stopPropagation();

              const result = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });

              if (result) {
                const transaction = tr.setNodeMarkup(result.inside, undefined, {
                  checked: !event.target.checked,
                });
                view.dispatch(transaction);
                return true;
              }
            }

            return false;
          },
        },
      }),
    ];
  }

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
