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

  parseMarkdown() {
    return { block: "tr" };
  }
}
