// @flow
import { Editor } from "slate";
import isModKey from "../lib/isModKey";

export default function KeyboardBehavior() {
  function onKeyDown(
    ev: SyntheticKeyboardEvent<*>,
    editor: Editor,
    next: Function
  ) {
    if (isModKey(ev)) return next();

    switch (ev.key) {
      case "Enter":
        return onEnter(ev, editor, next);
      case "Tab":
        return onTab(ev, editor, next);
      case "Backspace":
        return onBackspace(ev, editor, next);
      default:
        return next();
    }
  }

  function onEnter(
    ev: SyntheticKeyboardEvent<*>,
    editor: Editor,
    next: Function
  ) {
    const { value } = editor;
    const { startBlock, selection } = value;
    if (selection.isExpanded) return next();
    if (!startBlock) return next();

    const endOffset = selection.end.offset;

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
  }

  function onTab(
    ev: SyntheticKeyboardEvent<*>,
    editor: Editor,
    next: Function
  ) {
    const { value } = editor;
    const { startBlock } = value;
    if (!startBlock) return next();

    // On tab, if at the end of the heading jump to the main body content
    // as if it is another input field (act the same as enter).
    if (startBlock.type === "heading1") {
      ev.preventDefault();
      return editor.splitBlock().setBlocks("paragraph");
    }

    return next();
  }

  function onBackspace(
    ev: SyntheticKeyboardEvent<*>,
    editor: Editor,
    next: Function
  ) {
    const { value } = editor;
    const { startBlock, selection } = value;
    if (!startBlock) return next();

    // If image or embed is selected go ahead and delete the whole block
    if (startBlock.type === "image" || startBlock.type === "link") {
      ev.preventDefault();
      return editor.removeNodeByKey(startBlock.key).moveToStartOfNextBlock();
    }

    if (selection.isExpanded) {
      // If we're about to remove a heading then ensure that its not collapsed
      if (
        selection.start.offset === 0 &&
        selection.end.offset === startBlock.text.length &&
        startBlock.type.match(/heading/)
      ) {
        editor.showContentBelow(startBlock);
      }

      return next();
    }

    // If at the start of a non-paragraph, convert it back into a paragraph
    if (selection.start.offset === 0) {
      if (startBlock.type === "paragraph" || startBlock.type === "code-line")
        return next();
      ev.preventDefault();

      // If we're about to remove a heading then ensure that its not collapsed
      if (startBlock.type.match(/heading/)) {
        editor.showContentBelow(startBlock);
      }
      editor.setBlocks("paragraph");

      if (startBlock.type === "list-item") {
        editor.unwrapBlock("bulleted-list");
      }

      return;
    }

    if (selection.isCollapsed) {
      const marksAtCursor = startBlock.getMarksAtRange(selection);
      const codeMarksAtCursor = marksAtCursor.filter(
        mark => mark.type === "code"
      );

      // If at the end of a code mark hitting backspace should remove the mark
      if (codeMarksAtCursor.size > 0) {
        ev.preventDefault();

        let iterationOffset = 0;
        const startOffset = selection.start.offset;
        const textNode = startBlock.getTextAtOffset(startOffset);
        const leavesUntilCode = textNode.leaves.takeUntil(v => {
          iterationOffset += v.text.length;
          return iterationOffset > startOffset;
        });

        const textUntilCode = leavesUntilCode.map(l => l.text).join("");
        const codeLeaf = leavesUntilCode.reverse().first();

        if (!codeLeaf) return next();
        if (startOffset !== textUntilCode.length) return next();

        return editor.removeMarkByKey(
          textNode.key,
          startOffset - codeLeaf.text.length,
          startOffset,
          "code"
        );
      }
    }
    return next();
  }

  return { onKeyDown };
}
