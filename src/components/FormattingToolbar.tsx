import * as React from "react";
import { Portal } from "react-portal";
import { EditorView } from "prosemirror-view";
import styled from "styled-components";
import getMenuItems from "../menus/formatting";
import LinkEditor from "./LinkEditor";
import Menu from "./Menu";
import isMarkActive from "../queries/isMarkActive";

type Props = {
  tooltip: typeof React.Component;
  commands: Record<string, any>;
  view: EditorView;
};

export default class FormattingToolbar extends React.Component<Props> {
  menuRef = React.createRef<HTMLDivElement>();
  state = {
    left: 0,
    top: 0,
    offset: 0,
  };

  componentDidMount() {
    this.setState(this.calculatePosition(this.props));
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState(this.calculatePosition(nextProps));
  }

  calculatePosition(props) {
    const { view } = props;

    const { selection } = view.state;

    // If there is no selection, the selection is empty or the selection is a
    // NodeSelection instead of a TextSelection then hide the formatting
    // toolbar offscreen
    if (!selection || selection.empty || selection.node) {
      return {
        left: -1000,
        top: 0,
      };
    }

    // based on the start and end of the selection calculate the position at
    // the center top
    const startPos = view.coordsAtPos(selection.$from.pos);
    const endPos = view.coordsAtPos(selection.$to.pos);
    const halfSelection = Math.abs(endPos.left - startPos.left) / 2;
    const centerOfSelection = startPos.left + halfSelection;

    // position the menu so that it is centered over the selection except in
    // the cases where it would extend off the edge of the screen. In these
    // instances leave a margin
    const { offsetWidth, offsetHeight } = this.menuRef.current;
    const margin = 12;
    const left = Math.min(
      window.innerWidth - offsetWidth - margin,
      Math.max(margin, centerOfSelection - offsetWidth / 2)
    );
    const top = Math.min(
      window.innerHeight - offsetHeight - margin,
      Math.max(margin, startPos.top - offsetHeight)
    );

    // if the menu has been offset to not extend offscreen then we should adjust
    // the position of the triangle underneath to correctly point to the center
    // of the selection still
    const offset = left - (centerOfSelection - offsetWidth / 2);

    return {
      left: left + window.scrollX,
      top: top + window.scrollY,
      offset,
    };
  }

  render() {
    const { view } = this.props;
    const { state } = view;
    const isActive = !state.selection.empty;
    const items = getMenuItems(state);
    const link = isMarkActive(state.schema.marks.link)(state);

    return (
      <Portal>
        <Wrapper
          active={isActive}
          ref={this.menuRef}
          top={this.state.top}
          left={this.state.left}
          offset={this.state.offset}
        >
          {link ? (
            <LinkEditor link={link} {...this.props} />
          ) : (
            <Menu items={items} {...this.props} />
          )}
        </Wrapper>
      </Portal>
    );
  }
}

const Wrapper = styled.div<{
  active: boolean;
  top: number;
  left: number;
  offset: number;
}>`
  padding: 8px 16px;
  position: absolute;
  z-index: ${props => {
    return props.theme.zIndex + 100;
  }};
  top: ${props => props.top}px;
  left: ${props => props.left}px;
  width: 316px;
  opacity: 0;
  background-color: ${props => props.theme.toolbarBackground};
  border-radius: 4px;
  transform: scale(0.95);
  transition: opacity 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275),
    transform 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transition-delay: 150ms;
  line-height: 0;
  height: 40px;
  box-sizing: border-box;
  pointer-events: none;
  white-space: nowrap;

  &::before {
    content: "";
    display: block;
    width: 24px;
    height: 24px;
    transform: translateX(-50%) rotate(45deg);
    background: ${props => props.theme.toolbarBackground};
    border-radius: 3px;
    z-index: -1;
    position: absolute;
    bottom: -2px;
    left: calc(50% - ${props => props.offset || 0}px);
  }

  * {
    box-sizing: border-box;
  }

  ${({ active }) =>
    active &&
    `
    transform: translateY(-6px) scale(1);
    pointer-events: all;
    opacity: 1;
  `};

  @media print {
    display: none;
  }
`;
