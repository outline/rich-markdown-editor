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

      // TODO: Remove entire para if link is the only item
      return (change: Change) =>
        change
          .removeNodeByKey(node.key)
          .insertBlock({
            type: "link",
            isVoid: true,
            data: { ...node.data.toJS(), embed: true, component },
          })
          .insertText(node.text);
    },
  };
}
