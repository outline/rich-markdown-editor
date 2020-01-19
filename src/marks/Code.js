// @flow
import { toggleMark } from "prosemirror-commands";

import Node from "./Mark";

function backticksFor(node, side) {
  let ticks = /`+/g,
    m,
    len = 0;

  if (node.isText) {
    while ((m = ticks.exec(node.text))) len = Math.max(len, m[0].length);
  }

  let result = len > 0 && side > 0 ? " `" : "`";
  for (let i = 0; i < len; i++) {
    result += "`";
  }
  if (len > 0 && side < 0) {
    result += " ";
  }
  return result;
}

export default class Code extends Node {
  get name() {
    return "code_inline";
  }

  get schema() {
    return {
      excludes: "strong em link",
      parseDOM: [{ tag: "code" }],
      toDOM: () => ["code"],
    };
  }

  keys({ type }) {
    // Note: This key binding only works on non-Mac platforms
    // https://github.com/ProseMirror/prosemirror/issues/515
    return {
      "Mod`": toggleMark(type),
    };
  }

  get toMarkdown() {
    return {
      open(_state, _mark, parent, index) {
        return backticksFor(parent.child(index), -1);
      },
      close(_state, _mark, parent, index) {
        return backticksFor(parent.child(index - 1), 1);
      },
      escape: false,
    };
  }

  parseMarkdown() {
    return { mark: "code_inline" };
  }
}
