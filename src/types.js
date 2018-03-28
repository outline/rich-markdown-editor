// @flow
import * as React from "react";
import { Value, Change, Node } from "slate";
import { Editor } from "slate-react";

export type SlateNodeProps = {
  children: React.Node,
  readOnly: boolean,
  attributes: Object,
  value: Value,
  editor: Editor,
  node: Node,
  parent: Node,
};

export type Plugin = {
  validateNode?: Node => *,
  onClick?: (SyntheticEvent<*>) => *,
  onKeyDown?: (SyntheticKeyboardEvent<*>, Change) => *,
};
