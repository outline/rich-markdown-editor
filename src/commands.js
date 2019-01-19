// @flow
import { Editor, Block, KeyUtils } from "slate";
import EditList from "./plugins/EditList";

const { changes } = EditList;

type SplitOptions = {
  type: string | Object,
  wrapper?: string | Object,
};

const commands = {
  wrapLink(editor: Editor, href: string) {
    editor.wrapInline({ type: "link", data: { href } });
  },

  unwrapLink(editor: Editor) {
    editor.unwrapInline("link");
  },

  splitAndInsertBlock(editor: Editor, options: SplitOptions) {
    const { type, wrapper } = options;
    const parent = editor.value.document.getParent(editor.value.startBlock.key);

    // lists get some special treatment
    if (parent && parent.type === "list-item") {
      editor
        .moveToStart()
        .command(changes.splitListItem)
        .moveToEndOfNodePreviousBlock()
        .command(changes.unwrapList);
    }

    if (wrapper) editor.moveToStartOfNextBlock();

    // this is a hack as insertBlock with normalize: false does not appear to work
    editor.insertBlock("paragraph").setBlocks(type, { normalize: false });

    if (wrapper) editor.wrapBlock(wrapper);
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
