// @flow
import React from "react";
import styled from "react-emotion";
import type { SlateNodeProps } from "../types";

function HorizontalRule(props: SlateNodeProps) {
  const { editor, node, attributes } = props;
  const active =
    editor.value.isFocused && editor.value.selection.hasEdgeIn(node);
  return <StyledHr active={active} {...attributes} />;
}

const StyledHr = styled.hr`
  padding-top: 0.75em;
  margin: 0;
  border: 0;
  border-bottom: 1px solid
    ${props =>
      props.active ? props.theme.selected : props.theme.horizontalRule};
`;

export default HorizontalRule;
