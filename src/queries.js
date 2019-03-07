// @flow
import { Editor, Value } from "slate";

const queries = {
  isLinkActive(editor: Editor, value: Value) {
    const { inlines } = value;
    return inlines.some(i => i.type === "link");
  },
};

export default queries;
