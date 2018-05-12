// @flow
import * as React from "react";
import type { SlateNodeProps as Props } from "../types";

export default function Link({
  attributes,
  node,
  children,
  editor,
  readOnly,
}: Props) {
  const href = node.data.get("href");

  return (
    <a
      {...attributes}
      href={readOnly ? href : undefined}
      onClick={
        readOnly
          ? undefined
          : ev => {
              if (editor.props.onClickLink) {
                ev.preventDefault();
                editor.props.onClickLink(href);
              }
            }
      }
      target="_blank"
    >
      {children}
    </a>
  );
}
