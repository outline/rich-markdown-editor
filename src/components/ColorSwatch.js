// @flow
import styled from "styled-components";

const ColorSwatch = styled.span.attrs({
  contentEditable: false,
})`
  pointer-events: none;
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-right: 2px;
  border-radius: 4px;
  position: relative;
  top: 2px;
  background: ${props => props.hex};
`;

export default ColorSwatch;
