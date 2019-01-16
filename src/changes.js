// @flow
import { Editor, Block, KeyUtils } from "slate";
import EditList from "./plugins/EditList";

const { changes } = EditList;

type Options = {
  type: string | Object,
  wrapper?: string | Object,
};

export function splitAndInsertBlock(editor: Editor, options: Options) {
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
}

export function insertImageFile(editor: Editor, file: window.File) {
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

  // load the file as a data URL
  let key = KeyUtils.create();
  const alt = "";
  const placeholderSrc = URL.createObjectURL(file);
  const node = Block.create({
    key,
    type: "image",
    isVoid: true,
    data: { src: placeholderSrc, alt, loading: true },
  });

  editor.insertBlock(node).insertBlock("paragraph");

  let props;

  uploadImage(file)
    .then(src => {
      // now we have a placeholder, start the image upload. This could be very fast
      // or take multiple seconds. The user can further edit the content during this time.
      if (!src) {
        throw new Error("No image url returned from uploadImage callback");
      }

      props = {
        data: { src, alt, loading: false },
      };
    })
    .catch(err => {
      if (onShowToast) {
        onShowToast("Sorry, an error occurred uploading the image");
      }
      throw err;
    })
    .finally(() => {
      if (onImageUploadStop) onImageUploadStop();

      // if there was an error during upload, remove the placeholder image
      if (!props) {
        editor.removeNodeByKey(key);
      } else {
        editor.setNodeByKey(key, props);
      }
    });

  return editor;
}
