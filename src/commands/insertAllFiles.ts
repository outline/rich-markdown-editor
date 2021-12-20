import { ToastType } from "../types";


// function findPlaceholderLink(doc, href) {
//   let result;

//   function findLinks(node, pos = 0) {
//     // get text nodes
//     if (node.type.name === "text") {
//       // get marks for text nodes
//       node.marks.forEach(mark => {
//         // any of the marks links?
//         if (mark.type.name === "link") {
//           // any of the links to other docs?
//           if (mark.attrs.href === href) {
//             result = { node, pos };
//             if (result) return false;
//           }
//         }
//       });
//     }

//     if (!node.content.size) {
//       return;
//     }

//     node.descendants(findLinks);
//   }

//   findLinks(doc);
//   return result;
// }

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

  // we'll use this to track of how many files have succeeded or failed
  let complete = 0;

  const { state } = view;
  const { from, to } = state.selection;

  console.log("state.selection: " + state.selection + "," + from + "," + to);

  // the user might have dropped multiple files at once, we need to loop
    for (const file of files) {

    // Insert a placeholder link
    var placeholder = `[${file.name} uploading...]`
    // const phref = `#uploading_${file.name}`;
    view.dispatch(
      view.state.tr
        .insertText(placeholder, from, to-1)
    );
    // start uploading the file file to the server. Using "then" syntax
    // to allow all placeholders to be entered at once with the uploads
    // happening in the background in parallel.
    uploadFile(file)
      .then(src => {
        const title = file.name;
        const href = src;

        // const result = findPlaceholderLink(view.state.doc, phref);
        // console.log("placeholder: " + result + "," + result.pos + "," + result.node.nodeSize);
        // if (result) {
          // view.dispatch(
          //   view.state.tr
          //     .removeMark(
          //       result.pos,
          //       result.pos + result.node.nodeSize,
          //       state.schema.marks.link
          //     )
          // );
        // }

        view.dispatch(
          view.state.tr
            .delete(from, to + placeholder.length)
            .insertText(title, from, to)
            .addMark(
              from,
              to + title.length,
              state.schema.marks.link.create({ href })
            )
        );
      })
      .catch(error => {
        console.error(error);
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
