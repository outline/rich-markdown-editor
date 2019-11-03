// @flow
import * as React from "react";
import type { SlateNodeProps as Props } from "../types";

export default function Hashtag(props: Props) {
  const { attributes, node, children, editor, readOnly } = props;

  if (!editor.props.onClickHashtag) {
    return children;
  }

  return (
    <a
      {...attributes}
      href={readOnly ? node.text : undefined}
      onClick={
        readOnly
          ? ev => {
              if (editor.props.onClickHashtag) {
                ev.preventDefault();
                editor.props.onClickHashtag(node.text);
              }
            }
          : undefined
      }
    >
      {children}
    </a>
  );
}
