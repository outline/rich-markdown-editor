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
import { isInTable } from "prosemirror-tables";
import isNodeActive from "../queries/isNodeActive";
import isMarkActive from "../queries/isMarkActive";

export default function formattingMenuItems(state) {
  const { schema } = state;
  const isTable = isInTable(state);

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
      name: "separator",
      visible: !isTable,
    },
    {
      name: "heading",
      tooltip: "Heading",
      icon: Heading1Icon,
      active: isNodeActive(schema.nodes.heading, { level: 1 }),
      attrs: { level: 1 },
      visible: !isTable,
    },
    {
      name: "heading",
      tooltip: "Subheading",
      icon: Heading2Icon,
      active: isNodeActive(schema.nodes.heading, { level: 2 }),
      attrs: { level: 2 },
      visible: !isTable,
    },
    {
      name: "blockquote",
      tooltip: "Quote",
      icon: BlockQuoteIcon,
      active: isNodeActive(schema.nodes.blockquote),
      attrs: { level: 2 },
      visible: !isTable,
    },
    {
      name: "separator",
    },
    {
      name: "link",
      tooltip: "Create link",
      icon: LinkIcon,
      active: isMarkActive(schema.marks.link),
      attrs: { href: "" },
    },
  ];
}
