// @flow
import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { InputRule } from "prosemirror-inputrules";
import getDataTransferFiles from "../lib/getDataTransferFiles";
import Node from "./Node";

/**
 * Matches following attributes in Markdown-typed image: [, alt, src, title]
 *
 * Example:
 * ![Lorem](image.jpg) -> [, "Lorem", "image.jpg"]
 * ![](image.jpg "Ipsum") -> [, "", "image.jpg", "Ipsum"]
 * ![Lorem](image.jpg "Ipsum") -> [, "Lorem", "image.jpg", "Ipsum"]
 */
const IMAGE_INPUT_REGEX = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

const findPlaceholder = function(state, id) {
  const decos = uploadPlaceholderPlugin.getState(state);
  const found = decos.find(null, null, spec => spec.id === id);
  return found.length ? found[0].from : null;
};

const insertFiles = function(view, event, pos, files) {
  // filter to only include image files
  const images = files.filter(file => /image/i.test(file.type));
  if (images.length === 0) return;

  const {
    uploadImage,
    onImageUploadStart,
    onImageUploadStop,
    onShowToast,
  } = view.props;

  if (!uploadImage) {
    console.warn(
      "uploadImage callback must be defined to handle image uploads."
    );
    return;
  }

  // okay, we have some dropped images and a handler – lets stop this
  // event going any further up the stack
  event.preventDefault();

  // let the user know we're starting to process the images
  if (onImageUploadStart) onImageUploadStart();

  const { schema } = view.state;

  // we'll use this to track of how many images have succeeded or failed
  let complete = 0;

  // the user might have dropped multiple images at once, we need to loop
  for (const file of images) {
    // Use an object to act as the ID for this upload, clever.
    let id = {};

    const { tr } = view.state;

    // insert a placeholder at this position
    tr.setMeta(uploadPlaceholderPlugin, {
      add: { id, file, pos },
    });
    view.dispatch(tr);

    // start uploading the image file to the server. Using "then" syntax
    // to allow all placeholders to be entered at once with the uploads
    // happening in the background in parallel.
    uploadImage(file)
      .then(src => {
        const pos = findPlaceholder(view.state, id);

        // if the content around the placeholder has been deleted
        // then forget about inserting this image
        if (pos === null) return;

        // otherwise, insert it at the placeholder's position, and remove
        // the placeholder itself
        const transaction = view.state.tr
          .replaceWith(pos, pos, schema.nodes.image.create({ src }))
          .setMeta(uploadPlaceholderPlugin, { remove: { id } });

        view.dispatch(transaction);
      })
      .catch(error => {
        console.error(error);

        // cleanup the placeholder if there is a failure
        const transaction = view.state.tr.setMeta(uploadPlaceholderPlugin, {
          remove: { id },
        });
        view.dispatch(transaction);

        // let the user know
        if (onShowToast) {
          onShowToast("Sorry, an error occurred uploading the image");
        }
      })
      // eslint-disable-next-line no-loop-func
      .finally(() => {
        complete++;

        // once everything is done, let the user know
        if (complete === images.length) {
          if (onImageUploadStop) onImageUploadStop();
        }
      });
  }
};

// based on the example at: https://prosemirror.net/examples/upload/
const uploadPlaceholderPlugin = new Plugin({
  state: {
    init() {
      return DecorationSet.empty;
    },
    apply(tr, set) {
      // Adjust decoration positions to changes made by the transaction
      set = set.map(tr.mapping, tr.doc);

      // See if the transaction adds or removes any placeholders
      const action = tr.getMeta(this);

      if (action && action.add) {
        const element = document.createElement("div");
        element.className = "image placeholder";

        const img = document.createElement("img");
        img.src = URL.createObjectURL(action.add.file);

        element.appendChild(img);

        const deco = Decoration.widget(action.add.pos, element, {
          id: action.add.id,
        });
        set = set.add(tr.doc, [deco]);
      } else if (action && action.remove) {
        set = set.remove(
          set.find(null, null, spec => spec.id === action.remove.id)
        );
      }
      return set;
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
});

const uploadPlugin = new Plugin({
  props: {
    handleDOMEvents: {
      paste(view, event) {
        if (!view.props.editable) return;

        // check if we actually pasted any files
        const files = Array.prototype.slice
          .call(event.clipboardData.items)
          .map(dt => dt.getAsFile())
          .filter(file => file);

        if (files.length === 0) return;

        const { tr } = view.state;
        if (!tr.selection.empty) {
          tr.deleteSelection();
        }
        const pos = tr.selection.from;

        return insertFiles(view, event, pos, files);
      },
      drop(view, event) {
        if (!view.props.editable) return;

        // check if we actually dropped any files
        const files = getDataTransferFiles(event);
        if (files.length === 0) return;

        // grab the position in the document for the cursor
        const { pos } = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });

        return insertFiles(view, event, pos, files);
      },
    },
  },
});

export default class Image extends Node {
  get name() {
    return "image";
  }

  get schema() {
    return {
      inline: true,
      attrs: {
        src: {},
        alt: {
          default: null,
        },
      },
      content: "text*",
      marks: "",
      group: "inline",
      draggable: true,
      parseDOM: [
        {
          tag: "div[class=image]",
          getAttrs: (dom: HTMLElement) => {
            const img = dom.getElementsByTagName("img")[0];
            const caption = dom.getElementsByTagName("p")[0];

            return {
              src: img.getAttribute("src"),
              alt: caption.innerText,
            };
          },
        },
      ],
      toDOM: node => {
        return [
          "div",
          {
            class: "image",
          },
          ["img", node.attrs],
          ["p", { class: "caption" }, 0],
        ];
      },
    };
  }

  toMarkdown(state, node) {
    state.write(
      "![" +
        state.esc(node.textContent || "") +
        "](" +
        state.esc(node.attrs.src) +
        ")"
    );
  }

  parseMarkdown() {
    return {
      node: "image",
      getAttrs: token => ({
        src: token.attrGet("src"),
        alt: (token.children[0] && token.children[0].content) || null,
      }),
    };
  }

  commands({ type }) {
    return attrs => (state, dispatch) => {
      const { selection } = state;
      const position = selection.$cursor
        ? selection.$cursor.pos
        : selection.$to.pos;
      const node = type.create(attrs);
      const transaction = state.tr.insert(position, node);
      dispatch(transaction);
    };
  }

  inputRules({ type }) {
    return [
      new InputRule(IMAGE_INPUT_REGEX, (state, match, start, end) => {
        const [okay, alt, src] = match;
        const { tr } = state;

        if (okay) {
          tr.replaceWith(
            start - 1,
            end,
            type.create({
              src,
              alt,
            })
          );
        }

        return tr;
      }),
    ];
  }

  get plugins() {
    return [uploadPlaceholderPlugin, uploadPlugin];
  }
}
