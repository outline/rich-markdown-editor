// @flow
import { Change } from "slate";
import { getEventTransfer } from "slate-react";
import Markdown from "../serializer";

export default function MarkdownPaste() {
  return {
    onPaste(ev: SyntheticKeyboardEvent<*>, change: Change) {
      const transfer = getEventTransfer(ev);
      const { text } = transfer;
      if (transfer.type !== "text" && transfer.type !== "html") return;

      const fragment = Markdown.deserialize(text);
      change.insertFragment(fragment.document);

      return change;
    },
  };
}
