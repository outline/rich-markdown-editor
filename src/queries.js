// @flow
import { Editor, Value } from "slate";
import { List } from "immutable";

const queries = {
  isLinkActive(editor: Editor, value: Value) {
    const { inlines } = value;
    return inlines.some(i => i.type === "link");
  },

  getHighestSelectedBlocks(editor: Editor) {
    const { value } = editor;
    const range = value.selection;
    const { document } = value;

    const startBlock = document.getClosestBlock(range.start.key);
    const endBlock = document.getClosestBlock(range.end.key);

    if (startBlock === endBlock) {
      return List([startBlock]);
    }
    const ancestor = document.getCommonAncestor(startBlock.key, endBlock.key);
    const startPath = ancestor.getPath(startBlock.key);
    const endPath = ancestor.getPath(endBlock.key);

    return ancestor.nodes.slice(startPath[0], endPath[0] + 1);
  },
};

export default queries;
