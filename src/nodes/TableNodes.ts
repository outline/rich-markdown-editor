import { tableNodes } from "prosemirror-tables";

const schema = tableNodes({
  tableGroup: "block",
  cellContent: "paragraph+",
  cellAttributes: {},
});

export default {
  ...schema,
  // eslint-disable-next-line @typescript-eslint/camelcase
  table_cell: {
    ...schema.table_cell,
    toDOM(node) {
      return [
        "td",
        node.attrs.alignment
          ? { style: `text-align: ${node.attrs.alignment}` }
          : {},
        0,
      ];
    },
    attrs: {
      colspan: { default: 1 },
      rowspan: { default: 1 },
      alignment: { default: null },
    },
  },
  // eslint-disable-next-line @typescript-eslint/camelcase
  table_header: {
    ...schema.table_header,
    toDOM(node) {
      return [
        "th",
        node.attrs.alignment
          ? { style: `text-align: ${node.attrs.alignment}` }
          : {},
        0,
      ];
    },
    attrs: {
      colspan: { default: 1 },
      rowspan: { default: 1 },
      alignment: { default: null },
    },
  },
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
