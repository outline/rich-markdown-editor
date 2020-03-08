import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import Extension from "../lib/Extension";

export default class Placeholder extends Extension {
  get name() {
    return "placeholder";
  }

  get defaultOptions() {
    return {
      emptyNodeClass: "placeholder",
      headingPlaceholder: "Write something…",
      paragraphPlaceholder: "…or don't",
    };
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          decorations: state => {
            const { doc } = state;
            const decorations: Decoration[] = [];
            const completelyEmpty =
              doc.textContent === "" &&
              doc.childCount <= 2 &&
              doc.content.size <= 4;

            doc.descendants((node, pos) => {
              if (!completelyEmpty) {
                return;
              }
              if (pos !== 0 && node.type.name !== "paragraph") {
                return;
              }

              const decoration = Decoration.node(pos, pos + node.nodeSize, {
                class: this.options.emptyNodeClass,
                "data-empty-text":
                  pos === 0
                    ? this.options.headingPlaceholder
                    : this.options.paragraphPlaceholder,
              });
              decorations.push(decoration);
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  }
}
