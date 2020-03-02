import TableNodes from "./TableNodes";
import Node from "./Node";

export default class TableRow extends Node {
  get name() {
    return "tr";
  }

  get schema() {
    return {
      ...TableNodes.table_row,
      content: "(th | td)*",
    };
  }

  toMarkdown(state, node) {
    if (state.headerBuffer) {
      state.write(state.headerBuffer + "--|\n");
      state.headerBuffer = undefined;
    }
    state.write("| ");
    state.renderInline(node);
    state.write("\n");
  }

  parseMarkdown() {
    return { block: "tr" };
  }
}
