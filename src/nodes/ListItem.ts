import {
  splitListItem,
  sinkListItem,
  liftListItem,
} from "prosemirror-schema-list";
import Node from "./Node";

export default class ListItem extends Node {
  get name() {
    return "list_item";
  }

  get schema() {
    return {
      content: "paragraph block*",
      defining: true,
      draggable: true,
      parseDOM: [{ tag: "li" }],
      toDOM: () => ["li", 0],
    };
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
    state.renderContent(node);
  }

  parseMarkdown() {
    return { block: "list_item" };
  }
}
