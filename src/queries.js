// @flow
import { Editor, Value } from "slate";

const queries = {
  isLinkActive(editor: Editor, value: Value) {
    const { inlines } = value;
    return inlines.some(i => i.type === "link");
  },

  getLinkInSelection(editor: Editor, value: Value) {
    try {
      const selectedLinks = value.document
        .getLeafInlinesAtRange(value.selection)
        .filter(node => node.type === "link");

      if (selectedLinks.size) {
        const link = selectedLinks.first();
        const { selection } = value;

        if (selection.anchor.isInNode(link) || selection.focus.isInNode(link)) {
          return link;
        }
      }
    } catch (err) {
      // It's okay.
    }
  },
};

export default queries;
