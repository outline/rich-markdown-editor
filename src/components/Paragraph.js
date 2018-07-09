// @flow
import React from "react";
import type { SlateNodeProps } from "../types";

export default function Paragraph({ attributes, children }: SlateNodeProps) {
  return <p {...attributes}>{children}</p>;
}
