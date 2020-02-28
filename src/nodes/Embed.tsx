import * as React from "react";
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

  component({ node }) {
    const Component = node.attrs.component;
    return (
      <div contentEditable={false}>
        <Component attrs={node.attrs} />
      </div>
    );
  }

  commands({ type }) {
    return attrs => (state, dispatch) => {
      dispatch(
        state.tr.replaceSelectionWith(type.create(attrs)).scrollIntoView()
      );
      return true;
    };
  }

  toMarkdown(state, node) {
    state.ensureNewLine();
    state.write(
      "[" + state.esc(node.attrs.href) + "](" + state.esc(node.attrs.href) + ")"
    );
    state.write("\n\n");
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
