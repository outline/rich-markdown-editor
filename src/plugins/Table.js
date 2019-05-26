// @flow
import type { Editor, Change, Node } from "slate";

function TablePlugin() {
  return {
    schema: {
      blocks: {
        "table-cell": {
          data: {
            align: (align: string) => {
              return ["left", "center", "right"].includes(align);
            },
          },
          normalize(change: Change, error: { code: string, node: Node }) {
            if (error.code === "node_data_invalid") {
              change.setNodeByKey(error.node.key, {
                data: error.node.data.set("align", "left"),
              });
            }
          },
        },
      },
    },

    commands: {
      setColumnAlign(editor: Editor, align: string): Change {
        const pos = editor.getPosition(editor.value);
        const columnCells = editor.getCellsAtColumn(
          pos.table,
          pos.getColumnIndex()
        );

        columnCells.forEach(cell => {
          const data = cell.data.toObject();
          editor.setNodeByKey(cell.key, { data: { ...data, align } });
        });
        return editor;
      },

      clearSelectedColumn(editor: Editor, table: Node, columnIndex: number) {
        const cells = editor.getCellsAtColumn(table, columnIndex);

        cells.forEach(cell => {
          if (!cell) return;

          const data = cell.data.toObject();
          editor.setNodeByKey(cell.key, {
            data: {
              ...data,
              selected: undefined,
            },
          });
        });
      },

      clearSelectedRow(editor: Editor, table: Node, rowIndex: number) {
        const cells = editor.getCellsAtRow(table, rowIndex);

        cells.forEach(cell => {
          if (!cell) return;

          const data = cell.data.toObject();
          editor.setNodeByKey(cell.key, {
            data: {
              ...data,
              selected: undefined,
            },
          });
        });
      },

      resetAlign(editor: Editor, table: Node, rowIndex: number) {
        const headCells = editor.getCellsAtRow(table, 0);

        // we need to re-query position as the table has been edited
        // since it was originally queried (pre-insert)
        const position = editor.getPositionByKey(
          editor.value.document,
          table.key
        );
        const cells = editor.getCellsAtRow(position.table, rowIndex);

        // take the alignment data from the head cells and map onto
        // the individual data cells
        cells.forEach((cell, index) => {
          const headCell = headCells.get(index);
          const data = headCell.data.toObject();
          editor.setNodeByKey(cell.key, {
            data: { ...data, selected: undefined },
          });
        });
      },

      clearSelected(editor: Editor, table: Node) {
        const previouslySelectedRows = table.data.get("selectedRows") || [];
        const previouslySelectedColumns =
          table.data.get("selectedColumns") || [];

        editor.withoutSaving(() => {
          previouslySelectedRows.forEach(rowIndex => {
            editor.clearSelectedRow(table, rowIndex);
          });

          previouslySelectedColumns.forEach(columnIndex => {
            editor.clearSelectedColumn(table, columnIndex);
          });

          if (
            previouslySelectedRows.length ||
            previouslySelectedColumns.length
          ) {
            editor.setNodeByKey(table.key, {
              data: {
                selectedTable: false,
                selectedColumns: [],
                selectedRows: [],
              },
            });
          }
        });

        return editor;
      },

      selectColumn(editor: Editor, selected: boolean) {
        const pos = editor.getPosition(editor.value);
        const selectedColumn = pos.getColumnIndex();

        editor.withoutSaving(() => {
          editor.clearSelected(pos.table);

          editor.setNodeByKey(pos.table.key, {
            data: {
              selectedColumns: selected ? [selectedColumn] : [],
              selectedRows: [],
            },
          });

          const cells = editor.getCellsAtColumn(pos.table, selectedColumn);

          cells.forEach(cell => {
            const data = cell.data.toObject();
            editor.setNodeByKey(cell.key, {
              data: {
                ...data,
                selected,
              },
            });
          });
        });

        return editor;
      },

      selectRow(editor: Editor, selected: boolean) {
        const pos = editor.getPosition(editor.value);
        const selectedRow = pos.getRowIndex();

        editor.withoutSaving(() => {
          editor.clearSelected(pos.table);

          editor.setNodeByKey(pos.table.key, {
            data: {
              selectedColumns: [],
              selectedRows: selected ? [selectedRow] : [],
            },
          });

          const cells = editor.getCellsAtRow(pos.table, selectedRow);

          cells.forEach(cell => {
            const data = cell.data.toObject();
            editor.setNodeByKey(cell.key, {
              data: {
                ...data,
                selected,
              },
            });
          });
        });

        return editor;
      },

      selectAll(editor: Editor, selected: boolean = true) {
        const pos = editor.getPosition(editor.value);

        editor.withoutSaving(() => {
          editor.withoutNormalizing(() => {
            const width = pos.getWidth();
            const height = pos.getHeight();
            const data = {
              selectedTable: true,
              selectedColumns: Array.from(Array(width).keys()),
              selectedRows: Array.from(Array(height).keys()),
            };

            editor.setNodeByKey(pos.table.key, { data });

            for (let y = 0; y < pos.getHeight(); y++) {
              const cells = editor.getCellsAtRow(pos.table, y);

              cells.forEach(cell => {
                const data = cell.data.toObject();
                editor.setNodeByKey(cell.key, {
                  data: {
                    ...data,
                    selected,
                  },
                });
              });
            }
          });
        });
      },
    },
  };
}

export default TablePlugin;
