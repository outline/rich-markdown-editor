import {
  makeBlockMathInputRule,
  REGEX_BLOCK_MATH_DOLLARS,
  insertMathCmd,
} from "@benrbray/prosemirror-math";
import Node from "./Node";
import { InputRule } from "prosemirror-inputrules";

export default class MathDisplay extends Node {
  get name() {
    return "math_display";
  }

  get schema() {
    return {
      group: "block math",
      content: "text*",
      atom: true,
      code: true,
      toDOM: node => {
        console.log(`math display node`, node);
        return ["math-display", { class: "math-node" }, 0];
      },
      parseDOM: [
        {
          tag: "math-display",
        },
      ],
    };
  }

  commands({ type }) {
    return () => insertMathCmd(type);
  }

  inputRules({ type }) {
    return [makeBlockMathInputRule(REGEX_BLOCK_MATH_DOLLARS, type)];
  }

  // inputRules({ type }) {
  //   return [
  //     new InputRule(REGEX_BLOCK_MATH_DOLLARS, (state, match, start, end) => {
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

  toMarkdown(state, node) {
    state.write("$$\n");
    state.text(node.textContent, false);
    state.ensureNewLine();
    state.write("$$");
    state.closeBlock(node);
  }

  parseMarkdown() {
    return {
      node: "math_display",
      // node: "math_display",
      // getAttrs: token => {
      //   console.log(`math token dispaly`, token);
      //   return {
      //     content: token.content,
      //     // src: token.attrGet("src"),
      //     // alt: (token.children[0] && token.children[0].content) || null,
      //   };
      // },
    };
  }
}
