// @flow
import { Editor } from "slate";

const commands = {
  wrapLink(editor: Editor, href: string) {
    editor.wrapInline({ type: "link", data: { href } });
  },
  unwrapLink(editor: Editor) {
    editor.unwrapInline("link");
  },
};

export default commands;
