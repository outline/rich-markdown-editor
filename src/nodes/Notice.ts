import { textblockTypeInputRule } from "prosemirror-inputrules";
import { setBlockType } from "prosemirror-commands";
import Node from "./Node";

export default class Notice extends Node {
  get styleOptions() {
    return Object.entries({
      info: "Info",
      warning: "Warning",
      tip: "Tip",
    });
  }

  get name() {
    return "notice";
  }

  get schema() {
    return {
      attrs: {
        style: {
          default: "info",
        },
      },
      content: "text*",
      group: "block",
      defining: true,
      draggable: false,
      parseDOM: [{ tag: "div.notice-block", preserveWhitespace: "full" }],
      toDOM: node => {
        const select = document.createElement("select");
        select.addEventListener("change", this.handleStyleChange);

        this.styleOptions.forEach(([key, label]) => {
          const option = document.createElement("option");
          option.value = key;
          option.innerText = label;
          option.selected = node.attrs.style === key;
          select.appendChild(option);
        });

        return [
          "div",
          { class: `notice-block ${node.attrs.style}` },
          ["div", { contentEditable: false }, select],
          ["div", 0],
        ];
      },
    };
  }

  commands({ type }) {
    return attrs => setBlockType(type, attrs);
  }

  handleStyleChange = event => {
    const { view } = this.editor;
    const { tr } = view.state;
    const element = event.target;
    const { top, left } = element.getBoundingClientRect();
    const result = view.posAtCoords({ top, left });

    if (result) {
      const transaction = tr.setNodeMarkup(result.inside, undefined, {
        style: element.value,
      });
      view.dispatch(transaction);
    }
  };

  inputRules({ type }) {
    return [textblockTypeInputRule(/^\$\$\$$/, type)];
  }

  toMarkdown(state, node) {
    state.write("\n$$$" + (node.attrs.style || "info") + "\n");
    state.renderContent(node);
    state.ensureNewLine();
    state.write("$$$");
    state.closeBlock(node);
  }

  parseMarkdown() {
    return {
      block: "notice",
      noCloseToken: true,
      getAttrs: tok => ({ style: tok.info }),
    };
  }
}
