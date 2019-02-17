// @flow
import { Editor } from "slate";
import isModKey from "../lib/isModKey";

export default function KeyboardShortcuts() {
  function onKeyDown(
    ev: SyntheticKeyboardEvent<*>,
    editor: Editor,
    next: Function
  ) {
    if (!isModKey(ev)) return next();

    switch (ev.key) {
      case "b":
        ev.preventDefault();
        return toggleMark(editor, "bold", next);
      case "i":
        ev.preventDefault();
        return toggleMark(editor, "italic", next);
      case "u":
        ev.preventDefault();
        return toggleMark(editor, "underlined", next);
      case "d":
        ev.preventDefault();
        return toggleMark(editor, "deleted", next);
      case "k":
        ev.preventDefault();
        return editor.wrapLink("");
      default:
        return next();
    }
  }

  function toggleMark(editor: Editor, type: string, next: Function) {
    const { value } = editor;

    // don't allow formatting of main document title
    if (value.startBlock.type === "heading1") return next();

    editor.removeMark("code").toggleMark(type);
  }

  return { onKeyDown };
}
