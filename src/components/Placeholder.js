// @flow
import styled from "styled-components";

export default styled.span.attrs({
  contentEditable: false,
})`
  display: inline-block;
  width: 0;
  white-space: nowrap;
  float: left; // https://github.com/ianstormtaylor/slate/issues/1436
  pointer-events: none;
  user-select: none;
  color: ${props => props.theme.placeholder};
`;
