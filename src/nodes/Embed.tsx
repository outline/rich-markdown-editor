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
      atom: true,
      attrs: {
        href: {},
        component: {},
        matches: {},
      },
      parseDOM: [
        {
          tag: "iframe",
          getAttrs: (dom: HTMLIFrameElement) => {
            const { embeds } = this.editor.props;
            const href = dom.getAttribute("src") || "";

            if (embeds) {
              for (const embed of embeds) {
                const matches = embed.matcher(href);
                if (matches) {
                  return {
                    href,
                    component: embed.component,
                    matches,
                  };
                }
              }
            }

            return {};
          },
        },
      ],
      toDOM: node => [
        "iframe",
        { src: node.attrs.href, contentEditable: false },
        0,
      ],
    };
  }

  component({ isEditable, isSelected, theme, node }) {
    const Component = node.attrs.component;

    return (
      <Component
        attrs={node.attrs}
        isEditable={isEditable}
        isSelected={isSelected}
        theme={theme}
      />
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
        matches: token.attrGet("matches"),
        component: token.attrGet("component"),
      }),
    };
  }
}
