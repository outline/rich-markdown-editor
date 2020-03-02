import TableNodes from "./TableNodes";
import Node from "./Node";

export default class TableHeadCell extends Node {
  get name() {
    return "th";
  }

  get schema() {
    return TableNodes.table_header;
  }

  toMarkdown(state, node) {
    state.text(node.textContent);
    state.write(" | ");

    if (!state.headerBuffer) {
      state.headerBuffer = "|--";
    } else {
      state.headerBuffer += "--|--";
    }
  }

  parseMarkdown() {
    return { block: "th" };
  }
}
