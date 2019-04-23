// @flow
import styled from "styled-components";

const InlineCode = styled.code.attrs({
  spellCheck: false,
})`
  background: ${props => props.theme.codeBackground};
  border-radius: 4px;
  border: 1px solid ${props => props.theme.codeBorder};
  padding: 3px 6px;
  font-family: "Source Code Pro", Menlo, monospace;
  font-size: 85%;
`;

export default InlineCode;
