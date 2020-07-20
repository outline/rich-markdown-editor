import * as React from "react";
import scrollIntoView from "smooth-scroll-into-view-if-needed";
import styled, { withTheme } from "styled-components";
import { NextIcon } from "outline-icons";
import theme from "../theme";

type Props = {
  onClick: (event: React.MouseEvent) => void;
  onMouseOver: (event: React.MouseEvent) => void;
  icon: React.ReactNode;
  selected: boolean;
  title: string;
  theme: typeof theme;
};

function LinkSearchResult({ title, selected, icon, theme, ...rest }: Props) {
  const ref = React.useCallback(
    node => {
      if (selected && node) {
        scrollIntoView(node, {
          scrollMode: "if-needed",
          block: "center",
          boundary: parent => {
            // All the parent elements of your target are checked until they
            // reach the #link-search-results. Prevents body and other parent
            // elements from being scrolled
            return parent.id !== "link-search-results";
          },
        });
      }
    },
    [selected]
  );

  return (
    <ListItem ref={ref} selected={selected} {...rest}>
      <i>
        <NextIcon color={theme.toolbarItem} />
      </i>
      <IconWrapper>{icon}</IconWrapper>
      {title}
    </ListItem>
  );
}

const IconWrapper = styled.span`
  flex-shrink: 0;
  margin-right: 4px;
  opacity: 0.8;
`;

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
  cursor: pointer;
  user-select: none;

  i {
    visibility: ${props => (props.selected ? "visible" : "hidden")};
  }
`;

export default withTheme(LinkSearchResult);
