// @flow
import * as React from "react";
import styled from "styled-components";
import { CollapsedIcon } from "outline-icons";
import { Schema, Node as TNode } from "prosemirror-model";
import { textblockTypeInputRule } from "prosemirror-inputrules";
import { setBlockType, toggleBlockType } from "prosemirror-commands";
import { MarkdownSerializerState } from "prosemirror-markdown";
import headingToSlug from "../lib/headingToSlug";
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

  // component({ node, options, innerRef, isSelected, isEditable }) {
  //   const level = `h${node.attrs.level}`;
  //   const id = headingToSlug(node.textContent);

  //   return (
  //     <StyledHeading as={level}>
  //       <HiddenAnchor id={id} />
  //       <CollapseToggle collapsed={false} contentEditable={false}>
  //         <CollapsedIcon />
  //       </CollapseToggle>
  //       <div ref={innerRef} />
  //     </StyledHeading>
  //   );
  // }

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
    return (attrs: Object) => {
      return toggleBlockType(type, schema.nodes.paragraph, attrs);
    };
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

const CollapseToggle = styled.a`
  text-decoration: none;
  opacity: ${props => (props.disabled ? "0" : "1")};
  pointer-events: ${props => (props.disabled ? "none" : "all")};
  visibility: ${props => (props.collapsed ? "visible" : "hidden")};
  user-select: none;
  cursor: pointer;
  width: 24px;
  height: 24px;

  svg {
    ${props => props.collapsed && "transform: rotate(-90deg);"};
    fill: ${props =>
      props.collapsed ? props.theme.text : props.theme.placeholder};
    transition: transform 100ms ease-in-out;
  }

  &:hover {
    text-decoration: none;

    svg {
      fill: ${props => props.theme.text};
    }
  }
`;

export const StyledHeading = styled(Heading)`
  display: flex;
  align-items: center;
  position: relative;
  margin-left: -24px;

  &:hover {
    ${CollapseToggle} {
      visibility: visible;
    }
  }
`;

const HiddenAnchor = styled.a`
  visibility: hidden;
  display: block;
  position: relative;
  top: -50px;
`;
