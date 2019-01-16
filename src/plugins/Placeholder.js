//@flow
import invariant from "invariant";
import React from "react";
import { Node, Editor } from "slate";
import type { SlateNodeProps } from "../types";

function SlateReactPlaceholder(
  options: {
    placeholder?: string,
    when?: (node: Node, editor: Editor) => boolean,
  } = {}
) {
  const { placeholder, when } = options;

  invariant(
    placeholder,
    "You must pass `SlateReactPlaceholder` an `options.placeholder` string."
  );

  invariant(
    when,
    "You must pass `SlateReactPlaceholder` an `options.when` query."
  );

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
      mark: { type: "placeholder", data: { placeholder } },
    };

    return [...others, decoration];
  }

  /**
   * Render an inline placeholder for the placeholder mark.
   */
  function renderMark(props: SlateNodeProps, editor: Editor, next: Function) {
    const { children, mark } = props;

    if (mark.type === "placeholder") {
      const style = {
        pointerEvents: "none",
        display: "inline-block",
        width: "0",
        maxWidth: "100%",
        whiteSpace: "nowrap",
        float: "left",
        opacity: "0.333",
      };
      const content = mark.data.get("placeholder");

      return (
        <span>
          <span contentEditable={false} style={style}>
            {content}
          </span>
          {children}
        </span>
      );
    }

    return next();
  }

  return { decorateNode, renderMark };
}

export default SlateReactPlaceholder;
