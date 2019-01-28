// @flow

const schema = {
  blocks: {
    heading1: {
      nodes: [{ match: { object: "text" } }],
      marks: [""],
    },
    heading2: {
      nodes: [{ match: { object: "text" } }],
      marks: [""],
    },
    heading3: {
      nodes: [{ match: { object: "text" } }],
      marks: [""],
    },
    heading4: {
      nodes: [{ match: { object: "text" } }],
      marks: [""],
    },
    heading5: {
      nodes: [{ match: { object: "text" } }],
      marks: [""],
    },
    heading6: {
      nodes: [{ match: { object: "text" } }],
      marks: [""],
    },
    "block-quote": { marks: [""] },
    table: {
      nodes: [
        {
          match: {
            type: "table-row",
            nodes: [
              {
                match: [{ type: "table-head" }, { type: "table-cell" }],
              },
            ],
          },
        },
      ],
    },
    "horizontal-rule": {
      isVoid: true,
    },
    image: {
      isVoid: true,
    },
    link: { nodes: [{ objects: ["text"] }] },
    "block-toolbar": {
      isVoid: true,
    },
  },
  document: {
    nodes: [
      {
        match: [
          { type: "paragraph" },
          { type: "heading1" },
          { type: "heading2" },
          { type: "heading3" },
          { type: "heading4" },
          { type: "heading5" },
          { type: "heading6" },
          { type: "block-quote" },
          { type: "code" },
          { type: "horizontal-rule" },
          { type: "image" },
          { type: "bulleted-list" },
          { type: "ordered-list" },
          { type: "todo-list" },
          { type: "block-toolbar" },
          { type: "table" },
          { type: "link" },
        ],
        min: 1,
      },
    ],
  },
};

export default schema;
