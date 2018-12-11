// @flow
import * as React from "react";
import { Change, Node } from "slate";

type Options = {
  getComponent?: Node => ?React.Component<*>,
};

export default function Embeds({ getComponent }: Options) {
  return {
    validateNode(node: Node) {
      if (!getComponent) return;
      if (node.object !== "inline") return;
      if (node.type !== "link") return;

      const component = getComponent(node);
      if (!component) return;

      return (change: Change) =>
        change
          .removeNodeByKey(node.key)
          .insertBlock({
            ...node,
            type: "link",
            data: { ...node.data, embed: true, component },
          })
          .insertText(node.text);
    },
  };
}
