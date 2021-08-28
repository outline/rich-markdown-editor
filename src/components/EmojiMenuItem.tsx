import * as React from "react";
import BlockMenuItem, { Props as BlockMenuItemProps } from "./BlockMenuItem";
import styled, { withTheme } from "styled-components";

const Title = styled.p`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
`;

const EmojiTitle = ({
  emoji,
  title,
}: {
  emoji: React.ReactNode;
  title: React.ReactNode;
}) => {
  return (
    <Title>
      {emoji}
      &nbsp;&nbsp;
      {title}
    </Title>
  );
};

type EmojiMenuItemProps = Omit<BlockMenuItemProps, "shortcut"> & {
  emoji: string;
};

function EmojiMenuItem(props: EmojiMenuItemProps) {
  return (
    <BlockMenuItem
      {...props}
      title={<EmojiTitle emoji={props.emoji} title={props.title} />}
    />
  );
}

export default withTheme(EmojiMenuItem);
