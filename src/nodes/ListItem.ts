import {
  splitListItem,
  sinkListItem,
  liftListItem,
} from "prosemirror-schema-list";
import Node from "./Node";
import isInList from "../queries/isInList";

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
      "Shift-Enter": (state, dispatch) => {
        if (!isInList(state)) return false;
        if (!state.selection.empty) return false;

        const { tr, selection } = state;
        dispatch(tr.split(selection.to));
        return true;
      },
    };
  }

  toMarkdown(state, node) {
    state.renderContent(node);
  }

  parseMarkdown() {
    return { block: "list_item" };
  }
}
