// @flow
import { Change } from "slate";
import isModKey from "../lib/isModKey";

export default function Ellipsis() {
  return {
    onKeyDown(ev: SyntheticKeyboardEvent<*>, change: Change) {
      if (!isModKey(ev) && ev.key === " ") {
        return this.onSpace(ev, change);
      }

      return null;
    },

    onSpace(ev: SyntheticKeyboardEvent<*>, change: Change) {
      const { value } = change;
      if (value.isExpanded) return;

      const { startBlock } = value;
      const startOffset = value.startOffset - 3;
      const textNode = startBlock.getFirstText();
      if (!textNode) return;

      const chars = textNode.text.slice(startOffset, startOffset + 3);

      // replaces three periods with the proper ellipsis character.
      if (chars === "...") {
        return change
          .removeTextByKey(textNode.key, startOffset, 3)
          .insertTextByKey(textNode.key, startOffset, "…");
      }
    },
  };
}
