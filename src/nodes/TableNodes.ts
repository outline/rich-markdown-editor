import { tableNodes } from "prosemirror-tables";

export default tableNodes({
  tableGroup: "block",
  cellContent: "block+",
  cellAttributes: {},
});
