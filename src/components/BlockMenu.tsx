import * as React from "react";
import { Portal } from "react-portal";
import { EditorView } from "prosemirror-view";
import { findParentNode } from "prosemirror-utils";
import styled, { withTheme } from "styled-components";
import {
  BlockQuoteIcon,
  BulletedListIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  HorizontalRuleIcon,
  OrderedListIcon,
  TodoListIcon,
  ImageIcon,
} from "outline-icons";

type Props = {
  isActive: boolean;
  commands: Record<string, any>;
  view: EditorView;
  search: string;
  onSubmit: () => void;
};

const getMenuItems = () => {
  return [
    {
      name: "heading",
      title: "Big heading",
      keywords: "h1 heading1 title",
      icon: Heading1Icon,
      shortcut: "⌘ ⇧ 1",
      attrs: { level: 1 },
    },
    {
      name: "heading",
      title: "Medium heading",
      keywords: "h2 heading2",
      icon: Heading2Icon,
      shortcut: "⌘ ⇧ 2",
      attrs: { level: 2 },
    },
    {
      name: "heading",
      title: "Small heading",
      keywords: "h3 heading3",
      icon: Heading2Icon,
      shortcut: "⌘ ⇧ 3",
      attrs: { level: 2 },
    },
    {
      name: "bullet_list",
      title: "Bulleted list",
      icon: BulletedListIcon,
      shortcut: "^ ⇧ 8",
    },
    {
      name: "ordered_list",
      title: "Ordered list",
      icon: OrderedListIcon,
      shortcut: "^ ⇧ 9",
    },
    {
      name: "checkbox_list",
      title: "Todo list",
      icon: TodoListIcon,
      keywords: "checklist checkbox task",
    },
    {
      name: "blockquote",
      title: "Quote",
      icon: BlockQuoteIcon,
      shortcut: "⌘ ]",
      attrs: { level: 2 },
    },
    {
      name: "code_block",
      title: "Code block",
      icon: CodeIcon,
      shortcut: "^ ⇧ \\",
      keywords: "script",
    },
    {
      name: "hr",
      title: "Break",
      icon: HorizontalRuleIcon,
      shortcut: "⌘ _",
      keywords: "horizontal rule line",
    },
    {
      name: "image",
      title: "Image",
      icon: ImageIcon,
      keywords: "picture photo",
    },
  ];
};

class BlockMenu extends React.Component<Props> {
  menuRef = React.createRef<HTMLDivElement>();

  state = {
    left: 0,
    top: undefined,
    bottom: undefined,
    isAbove: false,
  };

  componentDidMount() {
    window.addEventListener("keydown", this.handleKeyDown);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.isActive && !this.props.isActive) {
      this.setState(this.calculatePosition(nextProps));
    }
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown = event => {
    if (!this.props.isActive) return;

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();

      const selected = this.filtered[0];
      if (selected) {
        this.insertBlock(selected);
      } else {
        this.props.onSubmit();
      }
    }
  };

  insertBlock(item) {
    const { state, dispatch } = this.props.view;
    const parent = findParentNode(node => !!node)(state.selection);

    if (parent) {
      dispatch(
        state.tr.insertText(
          "",
          parent.pos,
          parent.pos + parent.node.textContent.length + 1
        )
      );
    }

    this.props.commands[item.name](item.attrs);
    this.props.onSubmit();
  }

  calculatePosition(props) {
    const { view } = props;

    const { selection } = view.state;

    if (!props.isActive) {
      return {
        left: -1000,
        top: 0,
      };
    }

    const startPos = view.coordsAtPos(selection.$from.pos);
    const { offsetHeight } = this.menuRef.current;
    const paragraph = view.domAtPos(selection.$from.pos);
    const { top, left, bottom } = paragraph.node.getBoundingClientRect();
    const margin = 24;

    if (startPos.top - offsetHeight > margin) {
      return {
        left: left + window.scrollX,
        top: undefined,
        bottom: window.innerHeight - top - window.scrollY,
        isAbove: false,
      };
    } else {
      return {
        left: left + window.scrollX,
        top: bottom + window.scrollY,
        bottom: undefined,
        isAbove: true,
      };
    }
  }

  get filtered() {
    const { search = "" } = this.props;
    const items = getMenuItems();

    return items.filter(item => {
      const n = search.toLowerCase();

      return (
        item.title.toLowerCase().includes(n) ||
        (item.keywords && item.keywords.toLowerCase().includes(n))
      );
    });
  }

  render() {
    const { isActive, theme } = this.props;
    const items = this.filtered;

    return (
      <Portal>
        <Wrapper active={isActive} ref={this.menuRef} {...this.state}>
          <List>
            {items.map((item, index) => {
              const Icon = item.icon;
              const selected = index === 0;

              return (
                <ListItem key={index}>
                  <MenuItem
                    onClick={() => this.insertBlock(item)}
                    selected={selected}
                  >
                    <Icon color={selected ? theme.black : undefined} />
                    &nbsp;&nbsp;{item.title}
                    <Shortcut>{item.shortcut}</Shortcut>
                  </MenuItem>
                </ListItem>
              );
            })}
            {items.length === 0 && (
              <ListItem>
                <Empty>No results</Empty>
              </ListItem>
            )}
          </List>
        </Wrapper>
      </Portal>
    );
  }
}

const Shortcut = styled.span`
  color: ${props => props.theme.textSecondary};
  flex-grow: 1;
  text-align: right;
`;

const List = styled.ol`
  list-style: none;
  text-align: left;
  height: 100%;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  padding: 0;
  margin: 0;
`;

const Empty = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.theme.textSecondary};
  font-weight: 500;
  font-size: 14px;
  height: 36px;
  padding: 0 16px;
`;

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
    background: ${props => props.theme.blockToolbarTrigger};
  }
`;

export const Wrapper = styled.div<{
  active: boolean;
  top: number;
  bottom: number;
  left: number;
  isAbove: boolean;
}>`
  color: ${props => props.theme.text};
  font-family: ${props => props.theme.fontFamily};
  position: absolute;
  z-index: ${props => {
    return props.theme.zIndex + 100;
  }};
  ${props => props.top && `top: ${props.top}px`};
  ${props => props.bottom && `bottom: ${props.bottom}px`};
  left: ${props => props.left}px;
  background-color: ${props => props.theme.background};
  border-radius: 4px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 0px 1px,
    rgba(0, 0, 0, 0.08) 0px 4px 8px, rgba(0, 0, 0, 0.08) 0px 2px 4px;
  opacity: 0;
  transform: scale(0.95);
  transition: opacity 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275),
    transform 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transition-delay: 150ms;
  line-height: 0;
  box-sizing: border-box;
  pointer-events: none;
  white-space: nowrap;
  width: 300px;
  max-height: 240px;
  overflow: hidden;
  overflow-y: auto;

  * {
    box-sizing: border-box;
  }

  ${({ active, isAbove }) =>
    active &&
    `
    transform: translateY(${isAbove ? "6px" : "-6px"}) scale(1);
    pointer-events: all;
    opacity: 1;
  `};

  @media print {
    display: none;
  }
`;

export default withTheme(BlockMenu);
