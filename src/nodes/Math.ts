
import styled from "styled-components";

import {
  chainCommands,
  deleteSelection,
  selectNodeBackward,
  joinBackward,
} from "prosemirror-commands";
import {
  mathPlugin,
  mathBackspaceCmd,
  insertMathCmd,
  makeInlineMathInputRule,
  REGEX_INLINE_MATH_DOLLARS,
} from "@benrbray/prosemirror-math";
import Node from "./Node";
import "katex/dist/katex.min.css";
import "@benrbray/prosemirror-math/style/math.css";
import { InputRule } from "prosemirror-inputrules";
import * as React from "react";

const ImageWrapper = styled.span`
  line-height: 0;
  display: inline-block;
`;

export default class Math extends Node {
  get name() {
    return "math_inline";
  }

  get schema() {
    return {
      group: "inline math",
      content: "text*",
      inline: true,
      atom: true,
      toDOM: node => {
        console.log(`math inline node`, node);
        return ["math-inline", { class: "math-node" }, 0];
      },
      parseDOM: [
        {
          tag: "math-inline",
        },
      ],
    };
  }

  // component = props => {
  //   console.log(`props`, props);
  //   return "HIII!!";
  // }

  commands({ type }) {
    return () => insertMathCmd(type);
  }

  inputRules({ schema }) {
    console.log(`schema`, schema);
    return [
      makeInlineMathInputRule(
        REGEX_INLINE_MATH_DOLLARS,
        schema.nodes.math_inline
      ),
    ];
  }

  // inputRules({ type }) {
  //   return [
  //     new InputRule(REGEX_INLINE_MATH_DOLLARS, (state, match, start, end) => {
  //       const [okay, alt, src, matchedTitle] = match;
  //       console.log(`match`, match);
  //       const { tr } = state;
  //       if (okay) {
  //         tr.replaceWith(
  //           start - 1,
  //           end,
  //           type.create({
  //             src,
  //             alt,
  //           })
  //         );
  //       }

  //       return tr;
  //     }),
  //   ];
  // }

  keys({ type }) {
    return {
      "Mod-Space": insertMathCmd(type),
      Backspace: chainCommands(
        deleteSelection,
        mathBackspaceCmd,
        joinBackward,
        selectNodeBackward
      ),
    };
  }

  get plugins() {
    return [mathPlugin];
  }

  toMarkdown(state, node) {
    state.write("$");
    state.renderInline(node);
    state.write("$");
  }

  parseMarkdown() {
    return {
      // block: "math_display",
      node: "math_inline",
      // getAttrs: token => {
      //   console.log(`math token inline`, token);
      //   return {
      //     content: token.content
      //     // src: token.attrGet("src"),
      //     // alt: (token.children[0] && token.children[0].content) || null,
      //   };
      // },
    };
  }
}
