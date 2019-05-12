// @flow
import { Editor } from "slate";

const queries = {
  isLinkActive(editor: Editor) {
    const { value } = editor;
    const { inlines } = value;
    return inlines.some(i => i.type === "link");
  },

  getLinkInSelection(editor: Editor) {
    try {
      const { value } = editor;
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
      console.error(err);
    }
  },
};

export default queries;
