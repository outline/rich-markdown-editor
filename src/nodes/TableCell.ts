import { DecorationSet, Decoration } from "prosemirror-view";
import { Plugin } from "prosemirror-state";
import {
  isTableSelected,
  isRowSelected,
  getCellsInColumn,
} from "prosemirror-utils";
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
    return {
      block: "td",
      getAttrs: tok => ({ alignment: tok.info }),
    };
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
                      let className = "grip-table";
                      const selected = isTableSelected(selection);
                      if (selected) {
                        className += " selected";
                      }
                      const grip = document.createElement("a");
                      grip.className = className;
                      grip.addEventListener("click", event => {
                        event.preventDefault();
                        this.options.onSelectTable(state);
                      });
                      return grip;
                    })
                  );
                }
                decorations.push(
                  Decoration.widget(pos + 1, () => {
                    const rowSelected = isRowSelected(index)(selection);

                    let className = "grip-row";
                    if (rowSelected) {
                      className += " selected";
                    }
                    if (index === 0) {
                      className += " first";
                    } else if (index === cells.length - 1) {
                      className += " last";
                    }
                    const grip = document.createElement("a");
                    grip.className = className;
                    grip.addEventListener("click", event => {
                      event.preventDefault();
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
