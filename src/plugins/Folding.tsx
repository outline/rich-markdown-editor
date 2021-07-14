import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import Extension from "../lib/Extension";
import { findBlockNodes } from "prosemirror-utils";

export default class Folding extends Extension {
  get name() {
    return "folding";
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          decorations: state => {
            const { doc } = state;
            const decorations: Decoration[] = [];
            const blocks = findBlockNodes(doc);

            let withinCollapsedHeading;

            for (const block of blocks) {
              if (block.node.type.name === "heading") {
                if (
                  !withinCollapsedHeading ||
                  block.node.attrs.level <= withinCollapsedHeading
                ) {
                  if (block.node.attrs.collapsed) {
                    if (!withinCollapsedHeading) {
                      withinCollapsedHeading = block.node.attrs.level;
                    }
                  } else {
                    withinCollapsedHeading = undefined;
                  }
                  continue;
                }
              }

              if (withinCollapsedHeading) {
                decorations.push(
                  Decoration.node(block.pos, block.pos + block.node.nodeSize, {
                    class: "folded-content",
                  })
                );
              }
            }

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  }
}
