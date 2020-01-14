// @flow
import * as React from "react";
import hashtagRegex from "hashtag-regex";
import type { SlateNodeProps as Props } from "../types";

const regex = hashtagRegex();

export default function Hashtag(props: Props) {
  const { attributes, node, children, editor, readOnly } = props;

  if (!editor.props.onClickHashtag || !node.text.match(regex)) {
    return children;
  }

  return (
    <a
      {...attributes}
      href={readOnly ? node.text : undefined}
      spellCheck={false}
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
