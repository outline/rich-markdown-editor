import TableNodes from "./TableNodes";
import Node from "./Node";

export default class TableHeader extends Node {
  get name() {
    return "thead";
  }

  get schema() {
    return TableNodes.table_header;
  }

  parseMarkdown() {
    return { block: "thead" };
  }
}
