// @flow
import { Editor } from "slate";

const commands = {
  wrapLink(editor: Editor, url: string) {
    editor.wrapInline({ type: "link", data: { url } });
  },
  unwrapLink(editor: Editor) {
    editor.unwrapInline("link");
  },
};

export default commands;
