// @flow
import * as React from "react";
import { Mark, Editor } from "slate";
import InlineCode from "./components/InlineCode";

type Props = {
  children: React$Element<*>,
  mark: Mark,
};

function renderMark(props: Props, editor: Editor, next: Function) {
  switch (props.mark.type) {
    case "bold":
      return <strong>{props.children}</strong>;
    case "code":
      return <InlineCode>{props.children}</InlineCode>;
    case "italic":
      return <em>{props.children}</em>;
    case "underlined":
      return <u>{props.children}</u>;
    case "deleted":
      return <del>{props.children}</del>;
    case "inserted":
      return <mark>{props.children}</mark>;
    default:
      return next();
  }
}

export default { renderMark };
