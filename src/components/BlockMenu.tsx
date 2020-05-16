import * as React from "react";
import { capitalize } from "lodash";
import { Portal } from "react-portal";
import { EditorView } from "prosemirror-view";
import { findParentNode } from "prosemirror-utils";
import styled from "styled-components";

import BlockMenuItem from "./BlockMenuItem";
import VisuallyHidden from "./VisuallyHidden";
import getDataTransferFiles from "../lib/getDataTransferFiles";
import insertFiles from "../commands/insertFiles";
import getMenuItems from "../menus/block";

const SSR = typeof window === "undefined";

type Props = {
  isActive: boolean;
  commands: Record<string, any>;
  view: EditorView;
  search: string;
  uploadImage: (file: File) => Promise<string>;
  onImageUploadStart: () => void;
  onImageUploadStop: () => void;
  onShowToast: (message: string) => void;
  onClose: () => void;
};

class BlockMenu extends React.Component<Props> {
  menuRef = React.createRef<HTMLDivElement>();
  inputRef = React.createRef<HTMLInputElement>();

  state = {
    left: -1000,
    top: undefined,
    bottom: undefined,
    isAbove: false,
    selectedIndex: 0,
  };

  componentDidMount() {
    if (!SSR) {
      window.addEventListener("keydown", this.handleKeyDown);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.search !== this.props.search ||
      nextProps.isActive !== this.props.isActive ||
      nextState !== this.state
    );
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isActive && this.props.isActive) {
      const position = this.calculatePosition(this.props);

      this.setState({
        selectedIndex: 0,
        ...position,
      });
    } else if (prevProps.search !== this.props.search) {
      this.setState({ selectedIndex: 0 });
    }
  }

  componentWillUnmount() {
    if (!SSR) {
      window.removeEventListener("keydown", this.handleKeyDown);
    }
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (!this.props.isActive) return;

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();

      const selected = this.filtered[this.state.selectedIndex];
      if (selected) {
        if (selected.name === "image") {
          this.triggerImagePick();
        } else {
          this.insertBlock(selected);
        }
      } else {
        this.props.onClose();
      }
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      const prevIndex = this.state.selectedIndex - 1;
      const prev = this.filtered[prevIndex];

      this.setState({
        selectedIndex: Math.max(
          0,
          prev && prev.name === "separator" ? prevIndex - 1 : prevIndex
        ),
      });
    }

    if (event.key === "ArrowDown" || event.key === "Tab") {
      event.preventDefault();
      event.stopPropagation();
      const total = this.filtered.length - 1;
      const nextIndex = this.state.selectedIndex + 1;
      const next = this.filtered[nextIndex];

      this.setState({
        selectedIndex: Math.min(
          next && next.name === "separator" ? nextIndex + 1 : nextIndex,
          total
        ),
      });
    }

    if (event.key === "Escape") {
      this.props.onClose();
    }
  };

  triggerImagePick = () => {
    if (this.inputRef.current) {
      this.inputRef.current.click();
    }
  };

  handleImagePicked = event => {
    const files = getDataTransferFiles(event);

    const {
      view,
      uploadImage,
      onImageUploadStart,
      onImageUploadStop,
      onShowToast,
    } = this.props;
    const { state, dispatch } = view;
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

    insertFiles(view, event, parent.pos, files, {
      uploadImage,
      onImageUploadStart,
      onImageUploadStop,
      onShowToast,
    });
    this.props.onClose();
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

    const command = this.props.commands[item.name];
    if (command) {
      command(item.attrs);
    } else {
      this.props.commands[`create${capitalize(item.name)}`](item.attrs);
    }

    this.props.onClose();
  }

  calculatePosition(props) {
    const { view } = props;
    const { selection } = view.state;
    const startPos = view.coordsAtPos(selection.$from.pos);
    const { offsetHeight } = this.menuRef.current;
    const paragraph = view.domAtPos(selection.$from.pos);

    if (!props.isActive || !paragraph.node || SSR) {
      return {
        left: -1000,
        top: 0,
        bottom: undefined,
      };
    }

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

    const filtered = items.filter(item => {
      if (item.name === "separator") return true;

      const n = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(n) ||
        (item.keywords && item.keywords.toLowerCase().includes(n))
      );
    });

    // this block literally just trims unneccessary separators from the results
    return filtered.reduce((acc, item, index) => {
      // trim separators from start / end
      if (item.name === "separator" && index === 0) return acc;
      if (item.name === "separator" && index === filtered.length - 1)
        return acc;

      // trim double separators looking ahead / behind
      const prev = filtered[index - 1];
      if (prev && prev.name === "separator" && item.name === "separator")
        return acc;

      const next = filtered[index + 1];
      if (next && next.name === "separator" && item.name === "separator")
        return acc;

      // otherwise, continue
      return [...acc, item];
    }, []);
  }

  render() {
    const { isActive } = this.props;
    const items = this.filtered;

    return (
      <Portal>
        <Wrapper
          id="block-menu-container"
          active={isActive}
          ref={this.menuRef}
          {...this.state}
        >
          <List>
            {items.map((item, index) => {
              if (item.name === "separator") {
                return (
                  <ListItem key={index}>
                    <hr />
                  </ListItem>
                );
              }
              const selected = index === this.state.selectedIndex && isActive;

              return (
                <ListItem key={index}>
                  <BlockMenuItem
                    onClick={() =>
                      item.name === "image"
                        ? this.triggerImagePick()
                        : this.insertBlock(item)
                    }
                    selected={selected}
                    icon={item.icon}
                    title={item.title}
                    shortcut={item.shortcut}
                  ></BlockMenuItem>
                </ListItem>
              );
            })}
            {items.length === 0 && (
              <ListItem>
                <Empty>No results</Empty>
              </ListItem>
            )}
          </List>
          <VisuallyHidden>
            <input
              type="file"
              ref={this.inputRef}
              onChange={this.handleImagePicked}
              accept="image/*"
            />
          </VisuallyHidden>
        </Wrapper>
      </Portal>
    );
  }
}

const List = styled.ol`
  list-style: none;
  text-align: left;
  height: 100%;
  padding: 8px 0;
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
    return props.theme.zIndex + 9999;
  }};
  ${props => props.top && `top: ${props.top}px`};
  ${props => props.bottom && `bottom: ${props.bottom}px`};
  left: ${props => props.left}px;
  background-color: ${props => props.theme.blockToolbarBackground};
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
  max-height: 224px;
  overflow: hidden;
  overflow-y: auto;

  * {
    box-sizing: border-box;
  }

  hr {
    border: 0;
    height: 0;
    border-top: 1px solid ${props => props.theme.blockToolbarDivider};
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

export default BlockMenu;
