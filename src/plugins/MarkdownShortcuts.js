// @flow
import { Change } from "slate";

const inlineShortcuts = [
  { mark: "bold", shortcut: "**" },
  { mark: "bold", shortcut: "__" },
  { mark: "italic", shortcut: "*" },
  { mark: "italic", shortcut: "_" },
  { mark: "code", shortcut: "`" },
  { mark: "added", shortcut: "++" },
  { mark: "deleted", shortcut: "~~" },
];

export default function MarkdownShortcuts() {
  return {
    onKeyDown(ev: SyntheticKeyboardEvent<*>, change: Change) {
      const { value } = change;
      const { startBlock } = value;
      if (!startBlock) return null;

      // markdown shortcuts should not be parsed in code
      if (startBlock.type.match(/code/)) return null;

      switch (ev.key) {
        case "-":
          return this.onDash(ev, change);
        case "`":
          return this.onBacktick(ev, change);
        case " ":
          return this.onSpace(ev, change);
        case "Backspace":
          return this.onBackspace(ev, change);
        default:
          return null;
      }
    },

    /**
     * On space, if it was after an auto-markdown shortcut, convert the current
     * node into the shortcut's corresponding type.
     */
    onSpace(ev: SyntheticKeyboardEvent<*>, change: Change) {
      const { value } = change;
      if (value.isExpanded) return;
      const { startBlock, startOffset } = value;

      const chars = startBlock.text.slice(0, startOffset).trim();
      const type = this.getType(chars);

      if (type) {
        if (type === "list-item" && startBlock.type === "list-item") return;
        ev.preventDefault();

        let checked;
        if (chars === "[x]") checked = true;
        if (chars === "[ ]") checked = false;

        change
          .extendToStartOf(startBlock)
          .delete()
          .setBlocks(
            {
              type,
              data: { checked },
            },
            { normalize: false }
          );

        if (type === "list-item") {
          if (checked !== undefined) {
            change.wrapBlock("todo-list");
          } else if (chars === "1.") {
            change.wrapBlock("ordered-list");
          } else {
            change.wrapBlock("bulleted-list");
          }
        }

        return true;
      }

      // no inline shortcuts should work in headings
      if (startBlock.type.match(/heading/)) return null;

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
          return change
            .removeTextByKey(firstText.key, lastCodeTagIndex, shortcut.length)
            .removeTextByKey(firstText.key, firstCodeTagIndex, shortcut.length)
            .moveOffsetsTo(
              firstCodeTagIndex,
              lastCodeTagIndex - shortcut.length
            )
            .addMark(mark)
            .collapseToEnd()
            .removeMark(mark);
        }
      }
    },

    onDash(ev: SyntheticKeyboardEvent<*>, change: Change) {
      const { value } = change;
      if (value.isExpanded) return;
      const { startBlock, startOffset } = value;
      if (startBlock.type.match(/heading/)) return null;

      const chars = startBlock.text.slice(0, startOffset).replace(/\s*/g, "");

      if (chars === "--") {
        ev.preventDefault();
        return change
          .extendToStartOf(startBlock)
          .delete()
          .setBlocks(
            {
              type: "horizontal-rule",
              isVoid: true,
            },
            { normalize: false }
          )
          .insertBlock("paragraph")
          .collapseToStart();
      }
    },

    onBacktick(ev: SyntheticKeyboardEvent<*>, change: Change) {
      const { value } = change;
      if (value.isExpanded) return;
      const { startBlock, startOffset } = value;
      if (startBlock.type.match(/heading/)) return null;

      const chars = startBlock.text.slice(0, startOffset).replace(/\s*/g, "");

      if (chars === "``") {
        ev.preventDefault();
        return change
          .extendToStartOf(startBlock)
          .delete()
          .setBlocks({ type: "code" });
      }
    },

    onBackspace(ev: SyntheticKeyboardEvent<*>, change: Change) {
      const { value } = change;
      if (value.isExpanded) return;
      const { startBlock, selection, startOffset } = value;

      // If at the start of a non-paragraph, convert it back into a paragraph
      if (startOffset === 0) {
        if (startBlock.type === "paragraph") return;
        ev.preventDefault();

        change.setBlocks("paragraph");

        if (startBlock.type === "list-item") {
          change.unwrapBlock("bulleted-list");
        }

        return change;
      }

      // If at the end of a code mark hitting backspace should remove the mark
      if (selection.isCollapsed) {
        const marksAtCursor = startBlock.getMarksAtRange(selection);
        const codeMarksAtCursor = marksAtCursor.filter(
          mark => mark.type === "code"
        );

        if (codeMarksAtCursor.size > 0) {
          ev.preventDefault();

          const textNode = startBlock.getTextAtOffset(startOffset);
          const charsInCodeBlock = textNode.characters
            .takeUntil((v, k) => k === startOffset)
            .reverse()
            .takeUntil((v, k) => !v.marks.some(mark => mark.type === "code"));

          change.removeMarkByKey(
            textNode.key,
            startOffset - charsInCodeBlock.size,
            startOffset,
            "code"
          );
        }
      }
    },

    /**
     * Get the block type for a series of auto-markdown shortcut `chars`.
     */
    getType(chars: string) {
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
    },
  };
}
