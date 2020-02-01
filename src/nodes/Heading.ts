import emojiRegex from "emoji-regex";
import { Plugin } from "prosemirror-state";
import copy from "copy-to-clipboard";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Node as ProsemirrorNode, NodeType } from "prosemirror-model";
import { textblockTypeInputRule } from "prosemirror-inputrules";
import { setBlockType } from "prosemirror-commands";
import { MarkdownSerializerState } from "prosemirror-markdown";
import backspaceToParagraph from "../commands/backspaceToParagraph";
import toggleBlockType from "../commands/toggleBlockType";
import headingToSlug from "../lib/headingToSlug";
import Node from "./Node";

export default class Heading extends Node {
  get name() {
    return "heading";
  }

  get defaultOptions() {
    return {
      levels: [1, 2, 3, 4],
    };
  }

  get schema() {
    return {
      attrs: {
        level: {
          default: 1,
        },
        slug: {
          default: "",
        },
      },
      content: "inline*",
      group: "block",
      defining: true,
      draggable: false,
      parseDOM: this.options.levels.map(level => ({
        tag: `h${level}`,
        attrs: { level },
      })),
      toDOM: node => {
        const button = document.createElement("button");
        button.innerText = "#";
        button.className = "heading-anchor";
        button.addEventListener("click", this.handleCopyLink(node));

        return [`h${node.attrs.level}`, button, ["span", 0]];
      },
    };
  }

  toMarkdown(state: MarkdownSerializerState, node: ProsemirrorNode) {
    state.write(state.repeat("#", node.attrs.level) + " ");
    state.renderInline(node);
    state.closeBlock(node);
  }

  parseMarkdown() {
    return {
      block: "heading",
      getAttrs: (token: Record<string, any>) => ({
        level: +token.tag.slice(1),
      }),
    };
  }

  commands({ type, schema }) {
    return (attrs: Record<string, any>) => {
      return toggleBlockType(type, schema.nodes.paragraph, attrs);
    };
  }

  handleCopyLink = () => {
    return event => {
      const slug = `#${event.target.parentElement.parentElement.name}`;
      copy(window.location.href + slug);

      if (this.options.onShowToast) {
        this.options.onShowToast("Link copied to clipboard");
      }
    };
  };

  keys({ type }: { type: NodeType }) {
    const options = this.options.levels.reduce(
      (items, level) => ({
        ...items,
        ...{
          [`Shift-Ctrl-${level}`]: setBlockType(type, { level }),
        },
      }),
      {}
    );

    return {
      ...options,
      Backspace: backspaceToParagraph(type),
    };
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          decorations: state => {
            const { doc } = state;
            const decorations: Decoration[] = [];
            const index = 0;

            doc.descendants((node, pos) => {
              if (node.type.name !== this.name) return;

              // offset emoji in document title node
              if (node.attrs.level === 1) {
                const regex = emojiRegex();
                const text = node.textContent;
                const matches = regex.exec(text);
                const firstEmoji = matches ? matches[0] : null;
                const startsWithEmoji =
                  firstEmoji && text.startsWith(firstEmoji);

                decorations.push(
                  Decoration.node(pos, pos + node.nodeSize, {
                    class: startsWithEmoji ? "with-emoji" : undefined,
                  })
                );
              }

              decorations.push(
                Decoration.node(pos, pos + node.nodeSize, {
                  name: headingToSlug(node, index),
                  class: "heading-name",
                  nodeName: "a",
                })
              );
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  }

  inputRules({ type }: { type: NodeType }) {
    return this.options.levels.map(level =>
      textblockTypeInputRule(new RegExp(`^(#{1,${level}})\\s$`), type, () => ({
        level,
      }))
    );
  }
}
