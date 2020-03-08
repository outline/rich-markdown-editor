import TableNodes from "./TableNodes";
import Node from "./Node";

export default class TableCell extends Node {
  get name() {
    return "td";
  }

  get schema() {
    return TableNodes.table_cell;
  }

  toMarkdown(state, node) {
    state.renderInline(node);
    state.closed = false;
    state.out = `${state.out.replace(/\n?\n$/, "")} | `;
  }

  parseMarkdown() {
    return { block: "td" };
  }
}
