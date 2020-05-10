// import Node from "./Node";

// export default class LinkedList extends Node {
//   get name() {
//     return "linkedlist";
//   }

//   get schema() {
//     return {
//       content: "inline*",
//       group: "block",
//       parseDOM: [{ tag: "div[class=linkedlist]" }],
//       toDOM: node => {
//         return [
//           "div",
//           {
//             class: "linkedlist",
//           },
//           ["linkedlist", { ...node.attrs, contentEditable: false }]
//         ];
//       }
//     };
//   }

//   inputRules({ type }) {
//     return [markInputRule(/(?:==)([^=]+)(?:==)$/, type)];  /#\[(.+?(?!]#))]/g;
//   }

//   commands({ type }) {
//     return () => toggleWrap(type);
//   }

//   keys({ type }) {
//     return {
//       "Mod-]": toggleWrap(type),
//     };
//   }

//   toMarkdown(state, node) {
//     state.wrapBlock("> ", null, node, () => state.renderContent(node));
//   }

//   parseMarkdown() {
//     return { block: "blockquote" };
//   }
// }
