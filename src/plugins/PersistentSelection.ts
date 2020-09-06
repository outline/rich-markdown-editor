import { Plugin, NodeSelection } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import Extension from "../lib/Extension";

export default class PersistentSelection extends Extension {
  get name() {
    return "persistent-selection";
  }

  get defaultOptions() {
    return {
      selectionClass: "persistent-selection",
    };
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          decorations: ({ doc, selection }) => {
            if (!this.options.selectionClass) {
              return;
            }

            if (selection.empty) {
              return;
            }

            const decorationAttrs = {
              class: this.options.selectionClass,
            };
            let decoration: Decoration;

            if (selection instanceof NodeSelection) {
              decoration = Decoration.node(
                selection.from,
                selection.to,
                decorationAttrs
              );
            } else {
              decoration = Decoration.inline(
                selection.from,
                selection.to,
                decorationAttrs
              );
            }

            return DecorationSet.create(doc, [decoration]);
          },
        },
      }),
    ];
  }
}
