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
    state.renderInline(node);
    state.closed = false;
    state.out = `${state.out.replace(/\n?\n$/, "")} | `;

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
