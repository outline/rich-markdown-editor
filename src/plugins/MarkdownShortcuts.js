// @flow
import { Editor } from "slate";

const inlineShortcuts = [
  { mark: "bold", shortcut: "**" },
  { mark: "bold", shortcut: "__" },
  { mark: "italic", shortcut: "*" },
  { mark: "italic", shortcut: "_" },
  { mark: "code", shortcut: "`" },
  { mark: "inserted", shortcut: "++" },
  { mark: "deleted", shortcut: "~~" },
];

export default function MarkdownShortcuts() {
  function onKeyDown(
    ev: SyntheticKeyboardEvent<*>,
    editor: Editor,
    next: Function
  ) {
    const { value } = editor;
    const { startBlock } = value;
    if (!startBlock) return next();

    // markdown shortcuts should not be parsed in code
    if (startBlock.type.match(/code/)) return next();

    switch (ev.key) {
      case "-":
        return onDash(ev, editor, next);
      case "`":
        return onBacktick(ev, editor, next);
      case " ":
        return onSpace(ev, editor, next);
      default:
        return next();
    }
  }

  /**
   * On space, if it was after an auto-markdown shortcut, convert the current
   * node into the shortcut's corresponding type.
   */
  function onSpace(
    ev: SyntheticKeyboardEvent<*>,
    editor: Editor,
    next: Function
  ) {
    const { value } = editor;
    const { selection, startBlock } = value;
    if (selection.isExpanded) return next();

    const chars = startBlock.text.slice(0, selection.start.offset).trim();
    const type = getType(chars);

    if (type) {
      // only shortcuts to change heading size should work in headings
      if (startBlock.type.match(/heading/) && !type.match(/heading/)) {
        return next();
      }

      // don't allow doubling up a list item
      if (type === "list-item" && startBlock.type === "list-item") {
        return next();
      }
      ev.preventDefault();

      let checked;
      if (chars === "[x]") checked = true;
      if (chars === "[ ]") checked = false;

      editor.withoutNormalizing(c => {
        c
          .moveFocusToStartOfNode(startBlock)
          .delete()
          .setBlocks({
            type,
            data: { checked },
          });

        if (type === "list-item") {
          if (checked !== undefined) {
            return c.wrapBlock("todo-list");
          } else if (chars === "1.") {
            return c.wrapBlock("ordered-list");
          } else {
            return c.wrapBlock("bulleted-list");
          }
        }

        return next();
      });
    }

    for (const key of inlineShortcuts) {
      // find all inline characters
      let { mark, shortcut } = key;
      let inlineTags = [];

      // only add tags if they have spaces around them or the tag is beginning
      // or the end of the block
      for (let i = 0; i < startBlock.text.length; i++) {
        const { text } = startBlock;
        const start = i;
        const end = i + shortcut.length;
        const beginningOfBlock = start === 0;
        const endOfBlock = end === text.length;
        const surroundedByWhitespaces = [
          text.slice(start - 1, start),
          text.slice(end, end + 1),
        ].includes(" ");

        if (
          text.slice(start, end) === shortcut &&
          (beginningOfBlock || endOfBlock || surroundedByWhitespaces)
        ) {
          inlineTags.push(i);
        }
      }

      // if we have multiple tags then mark the text between
      if (inlineTags.length > 1) {
        const firstText = startBlock.getFirstText();
        const firstCodeTagIndex = inlineTags[0];
        const lastCodeTagIndex = inlineTags[inlineTags.length - 1];
        return editor
          .removeTextByKey(firstText.key, lastCodeTagIndex, shortcut.length)
          .removeTextByKey(firstText.key, firstCodeTagIndex, shortcut.length)
          .moveAnchorTo(firstCodeTagIndex, lastCodeTagIndex - shortcut.length)
          .addMark(mark)
          .moveToEnd()
          .removeMark(mark);
      }
    }

    return next();
  }

  function onDash(
    ev: SyntheticKeyboardEvent<*>,
    editor: Editor,
    next: Function
  ) {
    const { value } = editor;
    const { startBlock, selection } = value;
    if (selection.isExpanded) return next();
    if (startBlock.type.match(/heading/)) return next();

    const chars = startBlock.text
      .slice(0, selection.start.offset)
      .replace(/\s*/g, "");

    if (chars === "--") {
      ev.preventDefault();
      return editor
        .moveFocusToStartOfNode(startBlock)
        .delete()
        .setBlocks(
          {
            type: "horizontal-rule",
            isVoid: true,
          },
          { normalize: false }
        )
        .insertBlock("paragraph")
        .moveToStart();
    }

    return next();
  }

  function onBacktick(
    ev: SyntheticKeyboardEvent<*>,
    editor: Editor,
    next: Function
  ) {
    const { value } = editor;
    const { startBlock, selection } = value;
    if (selection.isExpanded) return next();
    if (startBlock.type.match(/heading/)) return next();

    const chars = startBlock.text
      .slice(0, selection.start.offset)
      .replace(/\s*/g, "");

    if (chars === "``") {
      ev.preventDefault();
      return editor
        .moveFocusToStartOfNode(startBlock)
        .delete()
        .setBlocks({ type: "code" });
    }

    return next();
  }

  /**
   * Get the block type for a series of auto-markdown shortcut `chars`.
   */
  function getType(chars: string) {
    switch (chars) {
      case "*":
      case "-":
      case "+":
      case "1.":
      case "[ ]":
      case "[x]":
        return "list-item";
      case ">":
        return "block-quote";
      case "#":
        return "heading1";
      case "##":
        return "heading2";
      case "###":
        return "heading3";
      case "####":
        return "heading4";
      case "#####":
        return "heading5";
      case "######":
        return "heading6";
      default:
        return null;
    }
  }

  return { onKeyDown };
}
