import uploadFilePlaceholderPlugin, {
  findPlaceholder,
} from "../lib/uploadFilePlaceholder";
import { ToastType } from "../types";

const insertAllFiles = function(view, event, pos, files, options) {
  if (files.length === 0) return;

  const {
    dictionary,
    uploadFile,
    onFileUploadStart,
    onFileUploadStop,
    onShowToast,
  } = options;

  if (!uploadFile) {
    console.warn("uploadFile callback must be defined to handle file uploads.");
    return;
  }

  // okay, we have some dropped files and a handler – lets stop this
  // event going any further up the stack
  event.preventDefault();

  // let the user know we're starting to process the files
  if (onFileUploadStart) onFileUploadStart();

  const { schema } = view.state;

  // we'll use this to track of how many files have succeeded or failed
  let complete = 0;
  // const { state } = view;
  // const { from, to } = state.selection;
  // the user might have dropped multiple files at once, we need to loop
  for (const file of files) {
    // Use an object to act as the ID for this upload, clever.
    const id = {};

    const { tr } = view.state;

    // insert a placeholder at this position
    tr.setMeta(uploadFilePlaceholderPlugin, {
      add: { id, file, pos },
    });
    view.dispatch(tr);

    // start uploading the file file to the server. Using "then" syntax
    // to allow all placeholders to be entered at once with the uploads
    // happening in the background in parallel.
    uploadFile(file)
      .then(src => {
        const pos = findPlaceholder(view.state, id);

        // if the content around the placeholder has been deleted
        // then forget about inserting this file
        if (pos === null) return;

        const transaction = view.state.tr
          .replaceWith(
            pos,
            pos,
            schema.nodes.container_file.create({ src, alt: file.name })
          )
          .setMeta(uploadFilePlaceholderPlugin, { remove: { id } });

        view.dispatch(transaction);
      })
      .catch(error => {
        console.error(error);

        // cleanup the placeholder if there is a failure
        const transaction = view.state.tr.setMeta(uploadFilePlaceholderPlugin, {
          remove: { id },
        });
        view.dispatch(transaction);

        // let the user know
        if (onShowToast) {
          onShowToast(dictionary.fileUploadError, ToastType.Error);
        }
      })
      // eslint-disable-next-line no-loop-func
      .finally(() => {
        complete++;

        // once everything is done, let the user know
        if (complete === files.length) {
          if (onFileUploadStop) onFileUploadStop();
        }
      });
  }
};

export default insertAllFiles;
