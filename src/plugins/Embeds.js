// @flow
import * as React from "react";
import { Editor, Node } from "slate";

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
      if (
        !getComponent ||
        node.type === "block" ||
        node.type !== "link" ||
        node.text !== node.data.get("href")
      )
        return next();

      const component = getComponent(node);
      if (!component) return next();

      const parent = findTopParent(editor.value.document, node);
      if (!parent) return next();

      if (parent.type !== "paragraph" || parent.text !== node.text)
        return next();

      return (editor: Editor) => {
        return editor.replaceNodeByKey(parent.key, {
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
      };
    },
  };
}
