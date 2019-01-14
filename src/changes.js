// @flow
import { Editor } from "slate";
import EditList from "./plugins/EditList";

const { changes } = EditList;
let uploadCount = 0;

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
      .call(changes.splitListItem)
      .moveToEndOfNodePreviousBlock()
      .call(changes.unwrapList);
  }

  if (wrapper) editor.moveToStartOfNextBlock();

  // this is a hack as insertBlock with normalize: false does not appear to work
  editor.insertBlock("paragraph").setBlocks(type, { normalize: false });

  if (wrapper) editor.wrapBlock(wrapper);
  return editor;
}

export async function insertImageFile(editor: Editor, file: window.File) {
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
  try {
    // load the file as a data URL
    const id = `rme-upload-${++uploadCount}`;
    const alt = "";
    const placeholderSrc = URL.createObjectURL(file);
    const node = {
      type: "image",
      isVoid: true,
      data: { src: placeholderSrc, id, alt, loading: true },
    };

    // insert / replace into document as uploading placeholder replacing
    // empty paragraphs if available.
    if (
      !editor.value.startBlock.text &&
      editor.value.startBlock.type === "paragraph"
    ) {
      editor.setBlocks(node);
    } else {
      editor.insertBlock(node);
    }

    editor.insertBlock("paragraph");

    let props;

    try {
      // now we have a placeholder, start the image upload. This could be very fast
      // or take multiple seconds. The user can further edit the content during this time.
      const src = await uploadImage(file);
      if (!src) {
        throw new Error("No image url returned from uploadImage callback");
      }

      props = {
        data: { src, alt, loading: false },
      };
    } catch (error) {
      if (onShowToast) {
        onShowToast("Sorry, an error occurred uploading the image");
      }
    }

    const placeholder = editor.value.document.findDescendant(
      node => node.data && node.data.get("id") === id
    );

    // the user may have removed the placeholder while the image was uploaded. In this
    // case we can quietly prevent updating the image.
    if (!placeholder) return;

    // if there was an error during upload, remove the placeholder image
    if (!props) {
      editor.removeNodeByKey(placeholder.key);
    } else {
      editor.setNodeByKey(placeholder.key, props);
    }
  } catch (err) {
    throw err;
  } finally {
    if (onImageUploadStop) onImageUploadStop();
  }
}
