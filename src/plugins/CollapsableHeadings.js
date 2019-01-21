// @flow
import { Editor, Node } from "slate";
import headingToSlug from "../lib/headingToSlug";

export default function CollapsableHeadings() {
  const commands = {
    showContentBelow(editor: Editor, node: Node) {
      return editor.updateContentBelow(node, false);
    },

    hideContentBelow(editor: Editor, node: Node) {
      return editor.updateContentBelow(node, true);
    },

    toggleContentBelow(editor: Editor, node: Node) {
      const collapsed = node.data.get("collapsed");
      const slugish = headingToSlug(editor.value.document, node);
      const persistKey = `${window.location.pathname}#${slugish}`;

      if (collapsed) {
        localStorage.removeItem(persistKey);
        return editor.showContentBelow(node);
      } else {
        localStorage.setItem(persistKey, "collapsed");
        return editor.hideContentBelow(node);
      }
    },

    updateContentBelow(editor: Editor, node: Node, hidden: boolean) {
      const { document } = editor.value;

      editor.setNodeByKey(node.key, { data: { collapsed: hidden } });

      let active;
      document.nodes.forEach(n => {
        if (active && n.type.match(/heading/)) {
          active = false;
          return;
        }
        if (active) {
          editor.setNodeByKey(n.key, { data: { hidden } });
        }
        if (n === node) active = true;
      });
    },
  };

  function normalizeNode(node: Node, editor: Editor, next: Function) {
    if (node.object !== "block") return next();

    if (node.type.match(/heading/)) {
      const slugish = headingToSlug(editor.value.document, node);
      const pathToHeading = `${window.location.pathname}#${slugish}`;
      const collapsed = node.data.get("collapsed");
      const persistedState = localStorage.getItem(pathToHeading);
      const shouldBeCollapsed = persistedState === "collapsed";

      if (collapsed !== shouldBeCollapsed) {
        return (editor: Editor) => {
          return editor
            .updateContentBelow(node, shouldBeCollapsed)
            .setNodeByKey(node.key, {
              data: { collapsed: shouldBeCollapsed },
            });
        };
      }
    }
  }

  return { commands, normalizeNode };
}
