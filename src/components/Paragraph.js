// @flow
import React from "react";
import { Document } from "slate";
import type { SlateNodeProps } from "../types";
import Placeholder from "./Placeholder";

export default function Paragraph({
  attributes,
  editor,
  node,
  parent,
  children,
  readOnly,
}: SlateNodeProps) {
  const parentIsDocument = parent instanceof Document;
  const firstParagraph =
    parent && parent.nodes.get(editor.props.title ? 1 : 0) === node;
  const lastParagraph = parent && parent.nodes.last() === node;
  const showPlaceholder =
    !readOnly &&
    parentIsDocument &&
    firstParagraph &&
    lastParagraph &&
    !node.text;

  return (
    <p {...attributes}>
      {children}
      {showPlaceholder && (
        <Placeholder contentEditable={false}>
          {editor.props.bodyPlaceholder}
        </Placeholder>
      )}
    </p>
  );
}
