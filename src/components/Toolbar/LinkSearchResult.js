// @flow
import * as React from "react";
import styled from "react-emotion";
import { NextIcon } from "outline-icons";

type Props = {
  innerRef?: Function,
  onClick: (SyntheticEvent<*>) => *,
  title: string,
};

function LinkSearchResult({ title, ...rest }: Props) {
  return (
    <ListItem {...rest} href="">
      <i>
        <NextIcon light />
      </i>
      {title}
    </ListItem>
  );
}

const ListItem = styled.a`
  display: flex;
  align-items: center;
  height: 28px;
  padding: 6px 8px 6px 0;
  color: ${props => props.theme.toolbarItem};
  font-family: ${props => props.theme.fontFamily};
  font-size: 15px;
  text-decoration: none;
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

export default LinkSearchResult;
