// @flow
import * as React from "react";
import type { SlateNodeProps as Props } from "../types";

export default function Link(props: Props) {
  const { attributes, node, children, editor, readOnly } = props;
  const embed = node.data.get("embed");
  const Component = node.data.get("component");
  const href = node.data.get("href");

  if (embed && Component) {
    return <Component {...props} />;
  }

  return (
    <a
      {...attributes}
      href={readOnly ? href : undefined}
      onClick={
        readOnly
          ? ev => {
              if (editor.props.onClickLink) {
                ev.preventDefault();
                editor.props.onClickLink(href);
              }
            }
          : undefined
      }
      target="_blank"
    >
      {children}
    </a>
  );
}
