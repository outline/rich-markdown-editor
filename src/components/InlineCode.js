// @flow
import React from "react";
import styled from "react-emotion";
const Code = props => <code spellCheck={false} {...props} />;

const InlineCode = styled(Code)`
  padding: 0.15em;
  background: ${props => props.theme.codeBackground};
  border-radius: 4px;
  border: 1px solid ${props => props.theme.codeBorder};
`;

export default InlineCode;
