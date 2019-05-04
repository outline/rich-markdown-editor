// @flow
import type { Editor, Change, Node } from "slate";

function TableAlignPlugin() {
  /*
   * Set align data for the current column
   */
  function setColumnAlign(editor: Editor, align: string): Change {
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
  }

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
      setColumnAlign,
    },
  };
}

export default TableAlignPlugin;
