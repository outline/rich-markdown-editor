import * as React from "react";
import styled from "styled-components";
import { NextIcon } from "outline-icons";

type Props = {
  onClick: (event: React.MouseEvent) => void;
  selected: boolean;
  title: string;
};

function LinkSearchResult({ title, ...rest }: Props) {
  return (
    <ListItem {...rest}>
      <i>
        <NextIcon light />
      </i>
      {title}
    </ListItem>
  );
}

const ListItem = styled.li<{
  selected: boolean;
}>`
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
    visibility: ${props => (props.selected ? "visible" : "hidden")};
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
