// @flow
import { Editor, Block, KeyUtils } from "slate";

const commands = {
  wrapLink(editor: Editor, href: string) {
    editor.wrapInline({ type: "link", data: { href } });
  },

  unwrapLink(editor: Editor) {
    editor.unwrapInline("link");
  },

  clearSelectedColumn(editor: Editor, table, columnIndex: number) {
    const cells = editor.getCellsAtColumn(table, columnIndex);

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

  clearSelectedRow(editor: Editor, table, rowIndex: number) {
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

  clearSelected(editor: Editor, table) {
    const previouslySelectedRow = table.data.get("selectedRow");
    const previouslySelectedColumn = table.data.get("selectedColumn");

    if (previouslySelectedRow !== undefined) {
      editor.clearSelectedRow(table, previouslySelectedRow);
    }
    if (previouslySelectedColumn !== undefined) {
      editor.clearSelectedColumn(table, previouslySelectedColumn);
    }

    editor.setNodeByKey(table.key, {
      data: {
        selectedColumn: undefined,
        selectedRow: undefined,
      },
    });
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

  insertImageFile(editor: Editor, file: window.File) {
    const {
      uploadImage,
      onImageUploadStart,
      onShowToast,
      onImageUploadStop,
    } = editor.props;

    if (!uploadImage) {
      console.warn(
        "uploadImage callback must be defined to handle image uploads."
      );
    }

    if (onImageUploadStart) onImageUploadStart();

    let key = KeyUtils.create();
    const alt = "";

    // load the file as a data URL
    const placeholderSrc = URL.createObjectURL(file);
    const node = Block.create({
      key,
      type: "image",
      isVoid: true,
      data: { src: placeholderSrc, alt, loading: true },
    });

    editor
      .insertBlock(node)
      .insertBlock("paragraph")
      .onChange(editor);

    // withoutSaving prevents this op from being added to the history, so you can't
    // undo back to showing the upload placeholder. 'onChange' addition is a hack
    // to get around a bug in slate-drop-or-paste-images
    editor.withoutSaving(editor => {
      // now we have a placeholder, start the image upload. This could be very fast
      // or take multiple seconds. The user may further edit the content during this time.
      uploadImage(file)
        .then(src => {
          if (!src) {
            throw new Error("No image url returned from uploadImage callback");
          }

          // replace the placeholder with the final image if we can. The user may have
          // removed it during upload so we need to take that into account.
          try {
            editor.setNodeByKey(key, {
              data: { src, alt, loading: false },
            });
          } catch (err) {
            console.warn("Image placeholder could not be found", err);
          }
        })
        .catch(err => {
          // if there was an error during upload, remove the placeholder image
          editor.removeNodeByKey(key);

          if (onShowToast) {
            onShowToast("Sorry, an error occurred uploading the image");
          }
          throw err;
        })
        .finally(() => {
          if (onImageUploadStop) onImageUploadStop();
        });
    });
  },
};

export default commands;
