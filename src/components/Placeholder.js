// @flow
import React from "react";
import styled from "react-emotion";

const Span = props => <span contentEditable={false} {...props} />;

export default styled(Span)`
  display: inline-block;
  width: 0;
  white-space: nowrap;
  float: left; // https://github.com/ianstormtaylor/slate/issues/1436
  pointer-events: none;
  user-select: none;
  color: ${props => props.theme.placeholder};
`;
