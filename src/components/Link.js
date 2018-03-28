// @flow
import * as React from "react";
import type { SlateNodeProps as Props } from "../types";

export default function Link({ attributes, node, children, readOnly }: Props) {
  const href = node.data.get("href");
  // const path = getPathFromUrl(href);

  // if (isInternalUrl(href) && readOnly) {
  //   // TODO INTERNAL LINK HANDLING
  //   return null;
  // }

  return (
    <a {...attributes} href={readOnly ? href : undefined} target="_blank">
      {children}
    </a>
  );
}
