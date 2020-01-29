import * as React from "react";
import scrollIntoView from "smooth-scroll-into-view-if-needed";
import styled, { withTheme } from "styled-components";
import theme from "../theme";

type Props = {
  selected: boolean;
  onClick: () => void;
  theme: typeof theme;
  icon: typeof React.Component;
  title: string;
  shortcut: string;
};

function BlockMenuItem({ selected, onClick, title, shortcut, icon }: Props) {
  const Icon = icon;

  const ref = React.useCallback(
    node => {
      if (selected && node) {
        scrollIntoView(node, {
          scrollMode: "always",
          block: "nearest",
        });
      }
    },
    [selected]
  );

  return (
    <MenuItem selected={selected} onClick={onClick} ref={ref}>
      <Icon color={selected ? theme.black : undefined} />
      &nbsp;&nbsp;{title}
      <Shortcut>{shortcut}</Shortcut>
    </MenuItem>
  );
}

const MenuItem = styled.button<{
  selected: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-weight: 500;
  font-size: 14px;
  width: 100%;
  height: 36px;
  cursor: pointer;
  border: none;
  color: ${props => (props.selected ? props.theme.black : props.theme.text)};
  background: ${props =>
    props.selected ? props.theme.blockToolbarTrigger : "none"};
  padding: 0 16px;
  outline: none;

  &:hover,
  &:active {
    color: ${props => props.theme.black};
    background: ${props => props.theme.greyLight};
  }
`;

const Shortcut = styled.span`
  color: ${props => props.theme.textSecondary};
  flex-grow: 1;
  text-align: right;
`;

export default withTheme(BlockMenuItem);
