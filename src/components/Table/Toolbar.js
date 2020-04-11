// @flow
import * as React from "react";
import { Editor } from "slate";
import { Portal } from "react-portal";
import { findDOMNode } from "react-dom";
import TableToolbar from "../Toolbar/TableToolbar";
import { Menu } from "../Toolbar";

// These widths should be updated whenever the toolbar styles change
const MENU_WIDTHS = {
  row: 148,
  column: 248,
  table: 68,
};

const MENU_ALIGN = {
  row: "left",
  column: "center",
  table: "left",
};

type Props = {
  editor: Editor,
  active: Boolean,
  type: "table" | "row" | "column",
  cell: ?HTMLElement,
};

type State = {
  left: number,
  top: number,
};

class Toolbar extends React.Component<Props, State> {
  menu: ?HTMLElement;

  state = {
    top: 0,
    left: 0,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!nextProps.cell) return;

    const element = findDOMNode(nextProps.cell);
    if (!(element instanceof HTMLElement)) return;

    const rect = element.getBoundingClientRect();
    const menuWidth = MENU_WIDTHS[nextProps.type];
    const menuHeight = 40;

    // Position the menu correctly depending on the type, cell and scroll position
    const left =
      MENU_ALIGN[nextProps.type] === "center"
        ? Math.round(
            rect.left + window.scrollX + rect.width / 2 - menuWidth / 2,
          )
        : Math.round(rect.left + window.scrollX - menuWidth / 2);
    const top = Math.round(rect.top + window.scrollY - menuHeight - 12);

    if (prevState.left !== left || prevState.top !== top) {
      return { left, top };
    }

    return null;
  }

  render() {
    const { editor, type, active } = this.props;
    if (!this.state.top && !this.state.left) return null;

    return (
      <Portal>
        <Menu active={active} style={this.state}>
          <TableToolbar
            editor={editor}
            isTableSelected={type === "table"}
            isRowSelected={type === "row"}
            isColumnSelected={type === "column"}
          />
        </Menu>
      </Portal>
    );
  }
}

export default Toolbar;
