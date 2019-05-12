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
        // the data rows
        cells.forEach((cell, index) => {
          const headCell = headCells.get(index);
          const data = headCell.data.toObject();
          editor.setNodeByKey(cell.key, { data });
        });
      },

      clearSelected(editor: Editor, table: Node) {
        const previouslySelectedRow = table.data.get("selectedRow");
        const previouslySelectedColumn = table.data.get("selectedColumn");

        if (previouslySelectedRow !== undefined) {
          editor.clearSelectedRow(table, previouslySelectedRow);
        }
        if (previouslySelectedColumn !== undefined) {
          editor.clearSelectedColumn(table, previouslySelectedColumn);
        }

        if (
          previouslySelectedRow !== undefined ||
          previouslySelectedColumn !== undefined
        ) {
          editor.setNodeByKey(table.key, {
            data: {
              selectedColumn: undefined,
              selectedRow: undefined,
            },
          });
        }
      },

      selectColumn(editor: Editor, selected: boolean) {
        const pos = editor.getPosition(editor.value);
        const selectedColumn = pos.getColumnIndex();

        editor.withoutSaving(() => {
          editor.clearSelected(pos.table);

          editor.setNodeByKey(pos.table.key, {
            data: {
              selectedColumn: selected ? selectedColumn : undefined,
              selectedRow: undefined,
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
              selectedColumn: undefined,
              selectedRow: selected ? selectedRow : undefined,
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
    },
  };
}

export default TablePlugin;
