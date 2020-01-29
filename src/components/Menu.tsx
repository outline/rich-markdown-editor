import * as React from "react";
import { EditorView } from "prosemirror-view";
import {
  BoldIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  ItalicIcon,
  BlockQuoteIcon,
  LinkIcon,
  StrikethroughIcon,
} from "outline-icons";
import { withTheme } from "styled-components";
import isNodeActive from "../queries/isNodeActive";
import isMarkActive from "../queries/isMarkActive";
import ToolbarButton from "./ToolbarButton";
import ToolbarSeparator from "./ToolbarSeparator";

type Props = {
  tooltip: typeof React.Component;
  commands: Record<string, any>;
  view: EditorView;
  theme: Record<string, string>;
};

const getMenuItems = ({ schema }) => {
  return [
    {
      name: "strong",
      tooltip: "Bold",
      icon: BoldIcon,
      active: isMarkActive(schema.marks.strong),
    },
    {
      name: "em",
      tooltip: "Italic",
      icon: ItalicIcon,
      active: isMarkActive(schema.marks.em),
    },
    {
      name: "strikethrough",
      tooltip: "Strikethrough",
      icon: StrikethroughIcon,
      active: isMarkActive(schema.marks.strikethrough),
    },
    {
      name: "code_inline",
      tooltip: "Code",
      icon: CodeIcon,
      active: isMarkActive(schema.marks.code_inline),
    },
    {
      separator: true,
    },
    {
      name: "heading",
      tooltip: "Heading",
      icon: Heading1Icon,
      active: isNodeActive(schema.nodes.heading, { level: 1 }),
      attrs: { level: 1 },
    },
    {
      name: "heading",
      tooltip: "Subheading",
      icon: Heading2Icon,
      active: isNodeActive(schema.nodes.heading, { level: 2 }),
      attrs: { level: 2 },
    },
    {
      name: "blockquote",
      tooltip: "Quote",
      icon: BlockQuoteIcon,
      active: isNodeActive(schema.nodes.blockquote),
      attrs: { level: 2 },
    },
    {
      separator: true,
    },
    {
      name: "link",
      tooltip: "Create link",
      icon: LinkIcon,
      active: isMarkActive(schema.marks.link),
      attrs: { href: "" },
    },
  ];
};

class Menu extends React.Component<Props> {
  render() {
    const { state } = this.props.view;
    const Tooltip = this.props.tooltip;
    const items = getMenuItems(state);

    return (
      <div>
        {items.map((item, index) => {
          if (item.separator) {
            return <ToolbarSeparator key={index} />;
          }
          const Icon = item.icon;
          const isActive = item.active(state);

          return (
            <ToolbarButton
              key={index}
              onClick={() => this.props.commands[item.name](item.attrs)}
              active={isActive}
            >
              <Tooltip tooltip={item.tooltip} placement="top">
                <Icon color={this.props.theme.toolbarItem} />
              </Tooltip>
            </ToolbarButton>
          );
        })}
      </div>
    );
  }
}

export default withTheme(Menu);
