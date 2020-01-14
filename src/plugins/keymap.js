// @flow
import {
  wrapIn,
  setBlockType,
  chainCommands,
  toggleMark,
  exitCode,
  joinUp,
  joinDown,
  lift,
  selectParentNode,
} from "prosemirror-commands";
import {
  wrapInList,
  splitListItem,
  liftListItem,
  sinkListItem,
} from "prosemirror-schema-list";
import { undo, redo } from "prosemirror-history";
import { undoInputRule } from "prosemirror-inputrules";

const isMac =
  typeof navigator !== "undefined" ? /Mac/.test(navigator.platform) : false;

export function buildKeymap(schema) {
  const createHardBreak = chainCommands(exitCode, (state, dispatch) => {
    dispatch(
      state.tr
        .replaceSelectionWith(schema.nodes.hard_break.create())
        .scrollIntoView()
    );
    return true;
  });

  const createHorizontalRule = (state, dispatch) => {
    dispatch(
      state.tr
        .replaceSelectionWith(schema.nodes.horizontal_rule.create())
        .scrollIntoView()
    );
    return true;
  };

  let base = {
    "Mod-z": undo,
    "Shift-Mod-z": redo,
    Backspace: undoInputRule,
    "Alt-ArrowUp": joinUp,
    "Alt-ArrowDown": joinDown,
    "Mod-BracketLeft": lift,
    Escape: selectParentNode,
    "Mod-b": toggleMark(schema.marks.strong),
    "Mod-B": toggleMark(schema.marks.strong),
    "Mod-i": toggleMark(schema.marks.em),
    "Mod-I": toggleMark(schema.marks.em),
    "Mod-`": toggleMark(schema.marks.code),
    "Shift-Ctrl-\\": setBlockType(schema.nodes.code_block),
    "Shift-Ctrl-0": setBlockType(schema.nodes.paragraph),
    "Shift-Ctrl-1": setBlockType(schema.nodes.heading, { level: 1 }),
    "Shift-Ctrl-2": setBlockType(schema.nodes.heading, { level: 2 }),
    "Shift-Ctrl-3": setBlockType(schema.nodes.heading, { level: 3 }),
    "Shift-Ctrl-4": setBlockType(schema.nodes.heading, { level: 4 }),
    "Shift-Ctrl-5": setBlockType(schema.nodes.heading, { level: 5 }),
    "Shift-Ctrl-6": setBlockType(schema.nodes.heading, { level: 6 }),
    "Shift-Ctrl-8": wrapInList(schema.nodes.bullet_list),
    "Shift-Ctrl-9": wrapInList(schema.nodes.ordered_list),
    "Ctrl->": wrapInList(schema.nodes.blockquote),
    "Mod-Enter": createHardBreak,
    "Shift-Enter": createHardBreak,
    Enter: splitListItem(schema.nodes.list_item),
    "Mod-[": liftListItem(schema.nodes.list_item),
    "Mod-]": sinkListItem(schema.nodes.list_item),
    "Mod-_": createHorizontalRule,
  };

  if (!isMac) {
    return {
      ...base,
      "Mod-y": redo,
    };
  }

  return {
    ...base,
    "Ctrl-Enter": createHardBreak,
  };
}
