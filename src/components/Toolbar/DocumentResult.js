// @flow
import * as React from "react";
import styled from "styled-components";

import NextIcon from "../Icon/NextIcon";

type Props = {
  innerRef?: Function,
  onClick: (SyntheticEvent<*>) => *,
  document: { title: string },
};

function DocumentResult({ document, ...rest }: Props) {
  return (
    <ListItem {...rest} href="">
      <i>
        <NextIcon light />
      </i>
      {document.title}
    </ListItem>
  );
}

const ListItem = styled.a`
  display: flex;
  align-items: center;
  height: 28px;
  padding: 6px 8px 6px 0;
  color: ${props => props.theme.white};
  font-size: 15px;
  overflow: hidden;
  white-space: nowrap;

  i {
    visibility: hidden;
  }

  &:hover,
  &:focus,
  &:active {
    font-weight: 500;
    outline: none;

    i {
      visibility: visible;
    }
  }
`;

export default DocumentResult;
