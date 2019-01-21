// @flow
import { Editor } from "slate";
import isModKey from "../lib/isModKey";

export default function KeyboardShortcuts() {
  const plugin = {
    onKeyDown(ev: SyntheticKeyboardEvent<*>, editor: Editor, next: Function) {
      if (!isModKey(ev)) {
        switch (ev.key) {
          case "Enter":
            return plugin.onEnter(ev, editor, next);
          case "Tab":
            return plugin.onTab(ev, editor, next);
          default:
            return next();
        }
      }

      switch (ev.key) {
        case "b":
          ev.preventDefault();
          return plugin.toggleMark(editor, "bold", next);
        case "i":
          ev.preventDefault();
          return plugin.toggleMark(editor, "italic", next);
        case "u":
          ev.preventDefault();
          return plugin.toggleMark(editor, "underlined", next);
        case "d":
          ev.preventDefault();
          return plugin.toggleMark(editor, "deleted", next);
        case "k":
          ev.preventDefault();
          return editor.wrapInline({ type: "link", data: { href: "" } });
        default:
          return next();
      }
    },

    toggleMark(editor: Editor, type: string, next: Function) {
      const { value } = editor;

      // don't allow formatting of main document title
      if (value.startBlock.type === "heading1") return next();

      editor.toggleMark(type);
    },

    /**
     * On return, if at the end of a node type that should not be extended,
     * create a new paragraph below it.
     */
    onEnter(ev: SyntheticKeyboardEvent<*>, editor: Editor, next: Function) {
      const { value } = editor;
      const { startBlock, selection } = value;
      if (selection.isExpanded) return next();

      const endOffset = selection.end.offset;

      // Hitting enter at the end of the line reverts to standard behavior
      if (!startBlock || endOffset === startBlock.length) return next();

      // Hitting enter while an image is selected should jump caret below and
      // insert a new paragraph
      if (startBlock.type === "image") {
        ev.preventDefault();
        return editor.splitBlock(10).setBlocks({
          type: "paragraph",
          text: "",
          isVoid: false,
        });
      }

      if (startBlock.type.match(/(heading|block-quote)/)) {
        ev.preventDefault();

        // if the heading is collapsed then show everything now so the user
        // isn't editing in a weird state with some content hidden
        editor.showContentBelow(startBlock);

        // Hitting enter in a heading or blockquote will split the node at that
        // point and make the new node a paragraph
        if (endOffset > 0) {
          return editor.splitBlock().setBlocks("paragraph");
        } else {
          return editor
            .splitBlock()
            .moveToStartOfPreviousBlock()
            .setBlocks("paragraph");
        }
      }

      return next();
    },

    /**
     * On tab, if at the end of the heading jump to the main body content
     * as if it is another input field (act the same as enter).
     */
    onTab(ev: SyntheticKeyboardEvent<*>, editor: Editor, next: Function) {
      const { value } = editor;

      if (value.startBlock.type === "heading1") {
        ev.preventDefault();
        return editor.splitBlock().setBlocks("paragraph");
      }

      return next();
    },
  };

  return plugin;
}
