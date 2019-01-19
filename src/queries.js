// @flow
import { Editor, Value } from "slate";

const queries = {
  isLinkActive(editor: Editor, value: Value) {
    const { inlines } = value;
    const active = inlines.some(i => i.type === "link");
    return active;
  },
};

export default queries;
