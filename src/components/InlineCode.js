// @flow
import styled from "styled-components";

const InlineCode = styled.code.attrs({
  spellCheck: false,
})`
  padding: 0.25em;
  background: ${props => props.theme.smoke};
  border-radius: 4px;
  border: 1px solid ${props => props.theme.smokeDark};
`;

export default InlineCode;
