import { DecorationSet, Decoration } from "prosemirror-view";
import { Plugin } from "prosemirror-state";
import { getCellsInRow } from "prosemirror-utils";
import TableNodes from "./TableNodes";
import Node from "./Node";

export default class TableHeadCell extends Node {
  get name() {
    return "th";
  }

  get schema() {
    return TableNodes.table_header;
  }

  toMarkdown(state, node) {
    state.renderContent(node);
  }

  parseMarkdown() {
    return { block: "th" };
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          decorations: state => {
            const { doc, selection } = state;
            const decorations: Decoration[] = [];
            const cells = getCellsInRow(0)(selection);

            if (cells) {
              cells.forEach(({ pos }, index) => {
                decorations.push(
                  Decoration.widget(pos + 1, () => {
                    const grip = document.createElement("a");
                    grip.className = "grip-column";
                    grip.addEventListener("click", () => {
                      this.options.onSelectColumn(index, state);
                    });
                    return grip;
                  })
                );
              });
            }

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  }
}
