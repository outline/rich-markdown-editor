// @flow
import styled from "styled-components";

const Placeholder = styled.span.attrs({
  contentEditable: false,
})`
  pointer-events: none;
  display: inline-block;
  width: 0;
  max-width: 100%;
  white-space: nowrap;
  line-height: 1.2em;
  color: ${props => props.theme.placeholder};
`;

export default Placeholder;
