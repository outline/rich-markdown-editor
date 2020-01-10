import { Schema } from "prosemirror-model";
import blockquote from "./nodes/blockquote";
import heading from "./nodes/heading";
import horizontal_rule from "./nodes/horizontal_rule";
import paragraph from "./nodes/paragraph";
import title from "./nodes/title";

const schema = new Schema({
  nodes: {
    doc: {
      content: "title block+",
    },
    ...blockquote,
    ...heading,
    ...horizontal_rule,
    ...paragraph,
    ...title,

    code_block: {
      content: "text*",
      group: "block",
      code: true,
      defining: true,
      marks: "",
      attrs: { params: { default: "" } },
      parseDOM: [
        {
          tag: "pre",
          preserveWhitespace: "full",
          getAttrs: node => ({
            params: node.getAttribute("data-params") || "",
          }),
        },
      ],
      toDOM(node) {
        return [
          "pre",
          node.attrs.params ? { "data-params": node.attrs.params } : {},
          ["code", 0],
        ];
      },
    },

    ordered_list: {
      content: "list_item+",
      group: "block",
      attrs: { order: { default: 1 }, tight: { default: false } },
      parseDOM: [
        {
          tag: "ol",
          getAttrs(dom) {
            return {
              order: dom.hasAttribute("start") ? +dom.getAttribute("start") : 1,
              tight: dom.hasAttribute("data-tight"),
            };
          },
        },
      ],
      toDOM(node) {
        return [
          "ol",
          {
            start: node.attrs.order == 1 ? null : node.attrs.order,
            "data-tight": node.attrs.tight ? "true" : null,
          },
          0,
        ];
      },
    },

    bullet_list: {
      content: "list_item+",
      group: "block",
      attrs: { tight: { default: false } },
      parseDOM: [
        {
          tag: "ul",
          getAttrs: dom => ({ tight: dom.hasAttribute("data-tight") }),
        },
      ],
      toDOM(node) {
        return ["ul", { "data-tight": node.attrs.tight ? "true" : null }, 0];
      },
    },

    list_item: {
      content: "paragraph block*",
      defining: true,
      parseDOM: [{ tag: "li" }],
      toDOM() {
        return ["li", 0];
      },
    },

    text: {
      group: "inline",
    },

    image: {
      inline: true,
      attrs: {
        src: {},
        alt: { default: null },
        title: { default: null },
      },
      group: "inline",
      draggable: true,
      parseDOM: [
        {
          tag: "img[src]",
          getAttrs(dom) {
            return {
              src: dom.getAttribute("src"),
              title: dom.getAttribute("title"),
              alt: dom.getAttribute("alt"),
            };
          },
        },
      ],
      toDOM(node) {
        return ["img", node.attrs];
      },
    },

    hard_break: {
      inline: true,
      group: "inline",
      selectable: false,
      parseDOM: [{ tag: "br" }],
      toDOM() {
        return ["br"];
      },
    },
  },

  marks: {
    em: {
      parseDOM: [
        { tag: "i" },
        { tag: "em" },
        { style: "font-style", getAttrs: value => value == "italic" && null },
      ],
      toDOM() {
        return ["em"];
      },
    },

    strong: {
      parseDOM: [
        { tag: "b" },
        { tag: "strong" },
        {
          style: "font-weight",
          getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
        },
      ],
      toDOM() {
        return ["strong"];
      },
    },

    link: {
      attrs: {
        href: {},
        title: { default: null },
      },
      inclusive: false,
      parseDOM: [
        {
          tag: "a[href]",
          getAttrs(dom) {
            return {
              href: dom.getAttribute("href"),
              title: dom.getAttribute("title"),
            };
          },
        },
      ],
      toDOM(node) {
        return ["a", node.attrs];
      },
    },

    code: {
      parseDOM: [{ tag: "code" }],
      toDOM() {
        return ["code"];
      },
    },
  },
});

export default schema;

// // @flow
// import type { Change, Node } from "slate";

// function removeInlines(
//   change: Change,
//   error: { code: string, node: Node, child: Node }
// ) {
//   if (error.code === "child_object_invalid") {
//     change.unwrapInlineByKey(error.child.key, error.child.type);
//   }
// }

// const schema = {
//   blocks: {
//     heading1: {
//       nodes: [{ match: { object: "text" } }],
//       marks: [""],
//       normalize: removeInlines,
//     },
//     heading2: {
//       nodes: [{ match: { object: "text" } }],
//       marks: [""],
//       normalize: removeInlines,
//     },
//     heading3: {
//       nodes: [{ match: { object: "text" } }],
//       marks: [""],
//       normalize: removeInlines,
//     },
//     heading4: {
//       nodes: [{ match: { object: "text" } }],
//       marks: [""],
//       normalize: removeInlines,
//     },
//     heading5: {
//       nodes: [{ match: { object: "text" } }],
//       marks: [""],
//       normalize: removeInlines,
//     },
//     heading6: {
//       nodes: [{ match: { object: "text" } }],
//       marks: [""],
//       normalize: removeInlines,
//     },
//     code: {
//       marks: [""],
//     },
//     "horizontal-rule": {
//       isVoid: true,
//     },
//     image: {
//       isVoid: true,
//     },
//     link: {
//       nodes: [{ match: { object: "text" } }],
//     },
//     "block-toolbar": {
//       isVoid: true,
//     },
//     "list-item": {
//       parent: [
//         { type: "bulleted-list" },
//         { type: "ordered-list" },
//         { type: "todo-list" },
//       ],
//       nodes: [
//         {
//           match: [
//             { object: "text" },
//             { type: "image" },
//             { type: "paragraph" },
//             { type: "bulleted-list" },
//             { type: "ordered-list" },
//             { type: "todo-list" },
//           ],
//         },
//       ],
//     },
//   },
//   document: {
//     nodes: [
//       {
//         match: [
//           { type: "paragraph" },
//           { type: "heading1" },
//           { type: "heading2" },
//           { type: "heading3" },
//           { type: "heading4" },
//           { type: "heading5" },
//           { type: "heading6" },
//           { type: "block-quote" },
//           { type: "code" },
//           { type: "horizontal-rule" },
//           { type: "image" },
//           { type: "bulleted-list" },
//           { type: "ordered-list" },
//           { type: "todo-list" },
//           { type: "block-toolbar" },
//           { type: "table" },
//           { type: "link" },
//         ],
//         min: 1,
//       },
//     ],
//   },
// };

// export default schema;
