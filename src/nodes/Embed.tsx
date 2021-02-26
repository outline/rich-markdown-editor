import * as React from "react";
import Node from "./Node";

const cache = {};

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
    const { embeds } = this.editor.props;

    // matches are cached in module state to avoid re running loops and regex
    // here. Unfortuantely this function is not compatible with React.memo or
    // we would use that instead.
    let Component = cache[node.attrs.href];

    if (!Component) {
      for (const embed of embeds) {
        const matches = embed.matcher(node.attrs.href);
        if (matches) {
          Component = cache[node.attrs.href] = embed.component;
        }
      }
    }

    if (!Component) {
      return null;
    }

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
      }),
    };
  }
}
