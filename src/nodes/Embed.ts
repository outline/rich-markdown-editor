import Node from "./Node";

export default class Embed extends Node {
  get name() {
    return "embed";
  }

  get schema() {
    return {
      content: "inline*",
      group: "block",
      attrs: {
        href: {},
        component: {},
      },
      parseDOM: [{ tag: "iframe" }],
      toDOM: node => [
        "iframe",
        { src: node.attrs.href, contentEditable: false },
        0,
      ],
    };
  }

  toMarkdown(state, node) {
    state.ensureNewLine();
    state.write(
      "[" + state.esc(node.attrs.href) + "](" + state.esc(node.attrs.href) + ")"
    );
    state.ensureNewLine();
  }

  parseMarkdown() {
    return {
      node: "embed",
      getAttrs: token => ({
        href: token.attrGet("href"),
        component: token.attrGet("component"),
      }),
    };
  }
}
