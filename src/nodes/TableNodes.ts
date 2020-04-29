import { tableNodes } from "prosemirror-tables";

const schema = tableNodes({
  tableGroup: "block",
  cellContent: "paragraph+",
  cellAttributes: {},
});

export default {
  ...schema,
  table: {
    content: "table_row+",
    tableRole: "table",
    isolating: true,
    group: "block",
    parseDOM: [{ tag: "table" }],
    toDOM() {
      return ["div", { class: "table-wrapper" }, ["table", ["tbody", 0]]];
    },
  },
};
