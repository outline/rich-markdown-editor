// @flow
import * as React from "react";
import { Change, Node, Range } from "slate";

type Options = {
  getComponent?: Node => ?React.ComponentType<*>,
};

function findTopParent(document, node): ?Node {
  let parent;
  while (node !== document) {
    parent = document.getParent(node.key);
    if (parent === document) return node;
    node = parent;
  }
}

export default function Embeds({ getComponent }: Options) {
  return {
    validateNode(node: Node) {
      if (!getComponent) return;
      if (node.object !== "inline") return;
      if (node.type !== "link") return;
      if (node.text !== node.data.get("href")) return;

      const component = getComponent(node);
      if (!component) return;

      return (change: Change) => {
        const document = change.value.document;
        const parent = findTopParent(document, node);
        if (!parent) return;

        const firstText = parent.getFirstText();
        const range = Range.create({
          anchorKey: firstText.key,
          anchorOffset: parent.text.length,
          focusKey: firstText.key,
          focusOffset: parent.text.length,
        });

        return change.withoutNormalization(c => {
          c.removeNodeByKey(node.key).insertBlockAtRange(range, {
            object: "block",
            type: "link",
            isVoid: true,
            nodes: [
              {
                object: "text",
                leaves: [{ text: "" }],
              },
            ],
            data: { ...node.data.toJS(), embed: true, component },
          });

          // Remove entire paragraph if link is the only item
          if (parent.type === "paragraph" && parent.text === node.text) {
            c.removeNodeByKey(parent.key);
          }

          return change;
        });
      };
    },
  };
}
