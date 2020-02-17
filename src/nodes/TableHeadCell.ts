import TableCell from "./TableCell";

export default class TableHeadCell extends TableCell {
  get name() {
    return "th";
  }

  parseMarkdown() {
    return { block: "th" };
  }
}
