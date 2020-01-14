// @flow
import { Schema } from "prosemirror-model";
import blockquote from "./nodes/blockquote";
import heading from "./nodes/heading";
import horizontal_rule from "./nodes/horizontal_rule";
import paragraph from "./nodes/paragraph";
import title from "./nodes/title";

const schema = new Schema({
  nodes: {
    text: {
      group: "inline",
    },
    doc: {
      content: "heading block+",
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
