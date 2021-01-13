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
import { ToastType } from "../types";

export default class Heading extends Node {
  className = "heading-name";

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
      },
      content: "inline*",
      group: "block",
      defining: true,
      draggable: false,
      parseDOM: this.options.levels.map(level => ({
        tag: `h${level}`,
        attrs: { level },
        contentElement: "span",
      })),
      toDOM: node => {
        const button = document.createElement("button");
        button.innerText = "#";
        button.type = "button";
        button.className = "heading-anchor";
        button.addEventListener("click", this.handleCopyLink());

        return [
          `h${node.attrs.level + (this.options.offset || 0)}`,
          button,
          ["span", { class: "heading-content" }, 0],
        ];
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
      // this is unfortunate but appears to be the best way to grab the anchor
      // as it's added directly to the dom by a decoration.
      const anchor = event.currentTarget.parentNode.previousSibling;
      if (!anchor.className.includes(this.className)) {
        throw new Error("Did not find anchor as previous sibling of heading");
      }
      const hash = `#${anchor.id}`;

      // the existing url might contain a hash already, lets make sure to remove
      // that rather than appending another one.
      const urlWithoutHash = window.location.href.split("#")[0];
      copy(urlWithoutHash + hash);

      if (this.options.onShowToast) {
        this.options.onShowToast(
          this.options.dictionary.linkCopied,
          ToastType.Info
        );
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
    const getAnchors = doc => {
      const decorations: Decoration[] = [];
      const previouslySeen = {};

      doc.descendants((node, pos) => {
        if (node.type.name !== this.name) return;

        // calculate the optimal id
        const slug = headingToSlug(node);
        let id = slug;

        // check if we've already used it, and if so how many times?
        // Make the new id based on that number ensuring that we have
        // unique ID's even when headings are identical
        if (previouslySeen[slug] > 0) {
          id = headingToSlug(node, previouslySeen[slug]);
        }

        // record that we've seen this slug for the next loop
        previouslySeen[slug] =
          previouslySeen[slug] !== undefined ? previouslySeen[slug] + 1 : 1;

        decorations.push(
          Decoration.widget(
            pos,
            () => {
              const anchor = document.createElement("a");
              anchor.id = id;
              anchor.className = this.className;
              return anchor;
            },
            {
              side: -1,
              key: id,
            }
          )
        );
      });

      return DecorationSet.create(doc, decorations);
    };

    const plugin = new Plugin({
      state: {
        init: (config, state) => {
          return getAnchors(state.doc);
        },
        apply: (tr, oldState) => {
          return tr.docChanged ? getAnchors(tr.doc) : oldState;
        },
      },
      props: {
        decorations: state => plugin.getState(state),
      },
    });

    return [plugin];
  }

  inputRules({ type }: { type: NodeType }) {
    return this.options.levels.map(level =>
      textblockTypeInputRule(new RegExp(`^(#{1,${level}})\\s$`), type, () => ({
        level,
      }))
    );
  }
}
