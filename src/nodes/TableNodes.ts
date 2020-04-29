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
      return [
        "div",
        { class: "scrollable-wrapper" },
        ["div", { class: "scrollable" }, ["table", ["tbody", 0]]],
        ["div", { class: "scrollable-shadow" }],
        ["div", { class: "scrollable-shadow" }],
      ];
    },
  },
};
