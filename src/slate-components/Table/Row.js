// @flow
import * as React from "react";
import styled from "styled-components";
import type { SlateNodeProps } from "../../types";

const StyledTr = styled.tr`
  position: relative;
  border-bottom: 1px solid ${props => props.theme.tableDivider};
`;

const Row = ({ children, attributes }: SlateNodeProps) => {
  return <StyledTr {...attributes}>{children}</StyledTr>;
};

export default Row;
