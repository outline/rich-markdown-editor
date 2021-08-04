import { InputRule } from "prosemirror-inputrules";
import { nameToEmoji } from 'gemoji'
import Node from "./Node";
export default class Emoji extends Node {
  get name() {
    return "emoji";
  }

  get schema() {
    return {
      attrs: {
        style: {
          default: "",
        },
      },
      inline: true,
      content: "text*",
      marks: "",
      group: "inline",
      selectable: true,
      draggable: true,
      parseDOM: [
        {
          tag: "span.emoji",
          preserveWhitespace: "full",
          // TODO:
          getAttrs: (dom: HTMLDivElement) => ({
            style: "dog"
          }),
        },
      ],
      toDOM: node => {
        const text = document.createTextNode(nameToEmoji[node.attrs.style])
        return ["span", { class: `emoji ${node.attrs.style}` }, text];
      },
    };
  }

  commands({ type }) {
    return attrs => (state, dispatch) => {
      console.log(dispatch)
      const { selection } = state;
      const position = selection.$cursor
        ? selection.$cursor.pos
        : selection.$to.pos;
      const node = type.create(attrs);
      const transaction = state.tr.insert(position, node);
      dispatch(transaction);
      return true;
    }
  }

  inputRules({ type }) {
    return [
      new InputRule(/^\:([a-zA-Z]+)\:$/, (state, match, start, end) => {
        const [okay, markup,] = match;
        const { tr } = state;
        if (okay) {
          tr.replaceWith(
            start - 1,
            end,
            type.create({
              style: markup,
              markup,
            })
          );
        }

        return tr;
      }),
    ]
  }

  toMarkdown(state, node) {
    state.write(":" + (node.attrs.style || "dog") + ":");
  }

  parseMarkdown() {
    return {
      node: "emoji",
      getAttrs: tok => {
        return { style: tok.markup.trim() }
      },
    };
  }
}
