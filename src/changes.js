// @flow
import { Change } from "slate";
import { Editor } from "slate-react";
import EditList from "./plugins/EditList";

const { changes } = EditList;
let uploadCount = 0;

type Options = {
  type: string | Object,
  wrapper?: string | Object,
};

export function splitAndInsertBlock(change: Change, options: Options) {
  const { type, wrapper } = options;
  const parent = change.value.document.getParent(change.value.startBlock.key);

  // lists get some special treatment
  if (parent && parent.type === "list-item") {
    change
      .collapseToStart()
      .call(changes.splitListItem)
      .collapseToEndOfPreviousBlock()
      .call(changes.unwrapList);
  }

  if (wrapper) change.collapseToStartOfNextBlock();

  // this is a hack as insertBlock with normalize: false does not appear to work
  change.insertBlock("paragraph").setBlocks(type, { normalize: false });

  if (wrapper) change.wrapBlock(wrapper);
  return change;
}

export async function insertImageFile(
  change: Change,
  file: window.File,
  editor: Editor
) {
  const { uploadImage, onImageUploadStart, onImageUploadStop } = editor.props;

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
      !change.value.startBlock.text &&
      change.value.startBlock.type === "paragraph"
    ) {
      change.setBlocks(node);
    } else {
      change.insertBlock(node);
    }

    change.insertBlock("paragraph");
    editor.onChange(change);

    let props;

    // now we have a placeholder, start the upload
    try {
      const src = await uploadImage(file);
      if (!src) {
        throw new Error("No image url returned from uploadImage callback");
      }

      props = {
        data: { src, alt, loading: false },
      };
    } catch (error) {
      props = {
        data: { alt, src: placeholderSrc, loading: false, error },
      };
    }

    const placeholder = editor.value.document.findDescendant(
      node => node.data && node.data.get("id") === id
    );
    change.setNodeByKey(placeholder.key, props);
    editor.onChange(change);
  } catch (err) {
    throw err;
  } finally {
    if (onImageUploadStop) onImageUploadStop();
  }
}
