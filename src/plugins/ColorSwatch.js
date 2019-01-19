// @flow
import React from "react";
import { Node, Editor } from "slate";
import type { SlateNodeProps } from "../types";
import ColorSwatch from "../components/ColorSwatch";

const hexRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

function ColorSwatchPlugin() {
  function when(editor: Editor, node: Node) {
    if (node.object !== "inline") return false;
    if (node.type !== "hashtag") return false;
    if (!node.text.match(hexRegex)) return false;
    return true;
  }

  /**
   * Decorate a match node with a placeholder mark when it fits the query.
   */
  function decorateNode(node: Node, editor: Editor, next: Function) {
    if (!editor.query(when, node)) {
      return next();
    }

    const others = next() || [];
    const first = node.getFirstText();
    const last = node.getLastText();

    const decoration = {
      anchor: { key: first.key, offset: 0 },
      focus: { key: last.key, offset: last.text.length },
      mark: { type: "color", data: { hex: node.text } },
    };

    return [...others, decoration];
  }

  /**
   * Render an inline placeholder for the placeholder mark.
   */
  function renderMark(props: SlateNodeProps, editor: Editor, next: Function) {
    const { children, mark } = props;

    if (mark.type === "color") {
      const hex = mark.data.get("hex");

      return (
        <span>
          <ColorSwatch hex={hex} />
          {children}
        </span>
      );
    }

    return next();
  }

  return { decorateNode, renderMark };
}

export default ColorSwatchPlugin;
