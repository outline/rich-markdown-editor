// @flow
import * as React from "react";
import { Editor, Node, Range } from "slate";

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
    normalizeNode(node: Node, editor: Editor, next: Function) {
      if (!getComponent) return next();
      if (node.type === "block") return next();
      if (node.type !== "link") return next();
      if (node.text !== node.data.get("href")) return next();

      const component = getComponent(node);
      if (!component) return next();

      return (editor: Editor) => {
        const document = editor.value.document;
        const parent = findTopParent(document, node);
        if (!parent) return next();

        const firstText = parent.getFirstText();
        const range = Range.create({
          anchor: { key: firstText.key, offset: parent.text.length },
          focus: { key: firstText.key, offset: parent.text.length },
        });

        return editor.withoutNormalizing(c => {
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

          return editor;
        });
      };
    },
  };
}
