import * as React from "react";
import { Portal } from "react-portal";
import { EditorView } from "prosemirror-view";
import styled from "styled-components";
import { isEqual } from "lodash";
import getTableColMenuItems from "../menus/tableCol";
import getTableRowMenuItems from "../menus/tableRow";
import getTableMenuItems from "../menus/table";
import getFormattingMenuItems from "../menus/formatting";
import LinkEditor, { SearchResult } from "./LinkEditor";
import Menu from "./Menu";
import isMarkActive from "../queries/isMarkActive";
import getMarkRange from "../queries/getMarkRange";
import isNodeActive from "../queries/isNodeActive";

const SSR = typeof window === "undefined";

type Props = {
  tooltip: typeof React.Component;
  commands: Record<string, any>;
  onSearchLink?: (term: string) => Promise<SearchResult[]>;
  onClickLink: (url: string) => void;
  view: EditorView;
};

const menuRef = React.createRef<HTMLDivElement>();

function calculatePosition(props) {
  const { view } = props;
  const { selection } = view.state;

  // If there is no selection, the selection is empty or the selection is a
  // NodeSelection instead of a TextSelection then hide the formatting
  // toolbar offscreen
  if (
    !selection ||
    !menuRef.current ||
    selection.empty ||
    selection.node ||
    SSR
  ) {
    return {
      left: -1000,
      top: 0,
      offset: 0,
    };
  }

  // based on the start and end of the selection calculate the position at
  // the center top
  const startPos = view.coordsAtPos(selection.$from.pos);
  const endPos = view.coordsAtPos(selection.$to.pos);

  // tables are an oddity, and need their own logic
  const isColSelection = selection.isColSelection && selection.isColSelection();
  const isRowSelection = selection.isRowSelection && selection.isRowSelection();

  if (isRowSelection) {
    endPos.left = startPos.left + 12;
  } else if (isColSelection) {
    const { node: element } = view.domAtPos(selection.$from.pos);
    const { width } = element.getBoundingClientRect();
    endPos.left = startPos.left + width;
  }

  const halfSelection = Math.abs(endPos.left - startPos.left) / 2;
  const centerOfSelection = startPos.left + halfSelection;

  // position the menu so that it is centered over the selection except in
  // the cases where it would extend off the edge of the screen. In these
  // instances leave a margin
  const { offsetWidth, offsetHeight } = menuRef.current;
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

export default class FloatingToolbar extends React.Component<Props> {
  state = {
    left: 0,
    top: 0,
    offset: 0,
  };

  componentDidUpdate() {
    const newState = calculatePosition(this.props);

    if (!isEqual(newState, this.state)) {
      this.setState(newState);
    }
  }

  componentDidMount() {
    this.setState(calculatePosition(this.props));
  }

  render() {
    const { view } = this.props;
    const { state } = view;
    const { selection }: { selection: any } = state;
    const isActive = !selection.empty;
    const isCodeSelection = isNodeActive(state.schema.nodes.code_block)(state);

    // toolbar is disabled in code blocks, no bold / italic etc
    if (isCodeSelection) {
      return null;
    }

    const isColSelection =
      selection.isColSelection && selection.isColSelection();
    const isRowSelection =
      selection.isRowSelection && selection.isRowSelection();
    const isTableSelection = isColSelection && isRowSelection;
    const link = isMarkActive(state.schema.marks.link)(state);
    const range = getMarkRange(selection.$from, state.schema.marks.link);

    let items = [];
    if (isTableSelection) {
      items = getTableMenuItems();
    } else if (isColSelection) {
      // TODO: There must be a more reliable way of getting the column index
      const path = selection.$from.path;
      const index = path[path.length - 5];
      items = getTableColMenuItems(state, index);
    } else if (isRowSelection) {
      // TODO: There must be a more reliable way of getting the row index
      const path = selection.$from.path;
      const index = path[path.length - 8];
      items = getTableRowMenuItems(state, index);
    } else {
      items = getFormattingMenuItems(state);
    }

    if (!items.length) {
      return null;
    }

    return (
      <Portal>
        <Wrapper
          active={isActive}
          ref={menuRef}
          top={this.state.top}
          left={this.state.left}
          offset={this.state.offset}
        >
          {link && range ? (
            <LinkEditor
              mark={range.mark}
              from={range.from}
              to={range.to}
              {...this.props}
            />
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
