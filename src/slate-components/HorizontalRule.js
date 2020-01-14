// @flow
import React from "react";
import styled from "styled-components";
import type { SlateNodeProps } from "../types";

function HorizontalRule(props: SlateNodeProps) {
  const { isSelected, attributes } = props;
  return <StyledHr isSelected={isSelected} {...attributes} />;
}

const StyledHr = styled.hr`
  padding-top: 0.75em;
  margin: 0;
  border: 0;
  border-bottom: 1px solid
    ${props =>
      props.isSelected ? props.theme.selected : props.theme.horizontalRule};
`;

export default HorizontalRule;
