// @flow
import { Schema, Node as TNode } from "prosemirror-model";
import { textblockTypeInputRule } from "prosemirror-inputrules";
import { setBlockType, toggleBlockType } from "prosemirror-commands";
import { MarkdownSerializerState } from "prosemirror-markdown";
import Node from "./Node";

export default class Heading extends Node {
  get name() {
    return "heading";
  }

  get defaultOptions() {
    return {
      levels: [1, 2, 3, 4, 5, 6],
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
      })),
      toDOM: (node: TNode) => [`h${node.attrs.level}`, 0],
    };
  }

  // heading id rule example
  // https://github.com/pubpub/pubpub-editor/blob/master/src/plugins/headerIds.js

  toMarkdown(state: MarkdownSerializerState, node: TNode) {
    state.write(state.repeat("#", node.attrs.level) + " ");
    state.renderInline(node);
    state.closeBlock(node);
  }

  parseMarkdown() {
    return {
      block: "heading",
      getAttrs: (token: Object) => ({ level: +token.tag.slice(1) }),
    };
  }

  commands({ type, schema }: { type: TNode, schema: Schema }) {
    return (attrs: Object) =>
      toggleBlockType(type, schema.nodes.paragraph, attrs);
  }

  keys({ type }: { type: TNode }) {
    return this.options.levels.reduce(
      (items, level) => ({
        ...items,
        ...{
          [`Shift-Ctrl-${level}`]: setBlockType(type, { level }),
        },
      }),
      {}
    );
  }

  inputRules({ type }: { type: TNode }) {
    return this.options.levels.map(level =>
      textblockTypeInputRule(new RegExp(`^(#{1,${level}})\\s$`), type, () => ({
        level,
      }))
    );
  }
}
