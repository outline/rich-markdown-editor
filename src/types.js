// @flow
import * as React from "react";
import { Value, Editor, Node, Mark as TMark } from "slate";
import { ReactEditor } from "slate-react";

export type SlateNodeProps = {
  children: React.Node,
  readOnly: boolean,
  attributes: Object,
  value: Value,
  editor: ReactEditor,
  node: Node,
  parent: Node,
  mark: TMark,
  isSelected: boolean,
};

export type Plugin = {
  validateNode?: (Node, Editor, Function) => *,
  onClick?: (SyntheticEvent<*>) => *,
  onKeyDown?: (SyntheticKeyboardEvent<*>, Editor, Function) => *,
};

export type SearchResult = {
  title: string,
  url: string,
};

export type Block =
  | "heading1"
  | "heading2"
  | "heading3"
  | "block-quote"
  | "code"
  | "code"
  | "horizontal-rule"
  | "bulleted-list"
  | "ordered-list"
  | "todo-list"
  | "image";

export type Mark = "bold" | "italic" | "deleted" | "code" | "link";

export type HiddenToolbarButtons = ?{
  marks?: Mark[],
  blocks?: Block[],
};

export type Theme = {
  almostBlack: string,
  lightBlack: string,
  almostWhite: string,
  white: string,
  white10: string,
  black: string,
  black10: string,
  primary: string,
  greyLight: string,
  grey: string,
  greyMid: string,
  greyDark: string,

  fontFamily: string,
  fontWeight: number | string,
  link: string,
  placeholder: string,
  textSecondary: string,
  textLight: string,
  selected: string,

  background: string,
  text: string,

  toolbarBackground: string,
  toolbarInput: string,
  toolbarItem: string,

  blockToolbarBackground: string,
  blockToolbarTrigger: string,
  blockToolbarTriggerIcon: string,
  blockToolbarItem: string,

  quote: string,
  codeBackground?: string,
  codeBorder?: string,
  horizontalRule: string,

  hiddenToolbarButtons?: HiddenToolbarButtons,
};
