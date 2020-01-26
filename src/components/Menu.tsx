import * as React from "react";
import { EditorView } from "prosemirror-view";
import {
  BoldIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  ItalicIcon,
  BlockQuoteIcon,
  //   LinkIcon,
  StrikethroughIcon,
} from "outline-icons";
import isNodeActive from "../queries/isNodeActive";

type Props = {
  tooltip: React.Component;
  commands: Record<string, any>;
  view: EditorView;
};

const isMarkActive = type => state => {
  const { from, $from, to, empty } = state.selection;

  return empty
    ? type.isInSet(state.storedMarks || $from.marks())
    : state.doc.rangeHasMark(from, to, type);
};

const getMenuItems = ({ schema }) => {
  return [
    [
      {
        name: "strong",
        title: "Bold",
        icon: BoldIcon,
        active: isMarkActive(schema.marks.strong),
      },
      {
        name: "em",
        title: "Italic",
        icon: ItalicIcon,
        active: isMarkActive(schema.marks.em),
      },
      {
        name: "strikethrough",
        title: "Strikethrough",
        icon: StrikethroughIcon,
        active: isMarkActive(schema.marks.strikethrough),
      },
      {
        name: "code_inline",
        title: "Code",
        icon: CodeIcon,
        active: isMarkActive(schema.marks.code_inline),
      },
    ],
    [
      {
        name: "heading",
        title: "Heading",
        icon: Heading1Icon,
        active: isNodeActive(schema.nodes.heading, { level: 1 }),
        attrs: { level: 1 },
      },
      {
        name: "heading",
        title: "Subheading",
        icon: Heading2Icon,
        active: isNodeActive(schema.nodes.heading, { level: 2 }),
        attrs: { level: 2 },
      },
      {
        name: "blockquote",
        title: "Quote",
        icon: BlockQuoteIcon,
        active: isNodeActive(schema.nodes.blockquote),
        attrs: { level: 2 },
      },
    ],
  ];
};

export default class Menu extends React.Component<Props> {
  render() {
    const { state } = this.props.view;
    const Tooltip = this.props.tooltip;
    const sections = getMenuItems(state);

    return (
      <div>
        {sections.map((section, index) => (
          <React.Fragment key={index}>
            {!!index && <span>-</span>}
            {section.map((item, index) => {
              const Icon = item.icon;
              const isActive = item.active(state);

              return (
                <button
                  key={index}
                  onClick={event => this.props.commands[item.name](item.attrs)}
                >
                  <Tooltip tooltip={item.title} placement="top">
                    <Icon /> {item.title} {isActive ? "active" : "inactive"}
                  </Tooltip>
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  }
}
