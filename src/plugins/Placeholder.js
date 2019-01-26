// @flow
import invariant from "invariant";
import React from "react";
import { Node, Editor } from "slate";
import type { SlateNodeProps } from "../types";
import Placeholder from "../components/Placeholder";

function PlaceholderPlugin(
  options: {
    placeholder?: string,
    when?: (editor: Editor, node: Node) => boolean,
  } = {}
) {
  const { placeholder, when } = options;

  invariant(
    placeholder,
    "You must pass `PlaceholderPlugin` an `options.placeholder` string."
  );

  invariant(when, "You must pass `PlaceholderPlugin` an `options.when` query.");

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
    if (!first || !last) return next();

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
      const content = mark.data.get("placeholder");

      return (
        <span>
          <Placeholder>{content}</Placeholder>
          {children}
        </span>
      );
    }

    return next();
  }

  return { decorateNode, renderMark };
}

export default PlaceholderPlugin;
