import { DecorationSet, Decoration } from "prosemirror-view";
import { Plugin } from "prosemirror-state";
import { getCellsInColumn } from "prosemirror-utils";
import TableNodes from "./TableNodes";
import Node from "./Node";

export default class TableCell extends Node {
  get name() {
    return "td";
  }

  get schema() {
    return TableNodes.table_cell;
  }

  toMarkdown(state, node) {
    state.renderContent(node);
  }

  parseMarkdown() {
    return { block: "td" };
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          decorations: state => {
            const { doc, selection } = state;
            const decorations: Decoration[] = [];
            const cells = getCellsInColumn(0)(selection);

            if (cells) {
              cells.forEach(({ pos }, index) => {
                if (index === 0) {
                  decorations.push(
                    Decoration.widget(pos + 1, () => {
                      const grip = document.createElement("a");
                      grip.className = "grip-table";
                      grip.addEventListener("click", () => {
                        this.options.onSelectTable(state);
                      });
                      return grip;
                    })
                  );
                }
                decorations.push(
                  Decoration.widget(pos + 1, () => {
                    const grip = document.createElement("a");
                    grip.className = "grip-row";
                    grip.addEventListener("click", () => {
                      this.options.onSelectRow(index, state);
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
