// @flow
import * as React from "react";
import { Portal } from "react-portal";
import { findDOMNode } from "react-dom";
import styled from "styled-components";
import TableToolbar from "../Toolbar/TableToolbar";
import { Menu } from "../Toolbar";
import Grip from "./Grip";

type State = {
  left: number,
  top: number,
};

class Cell extends React.Component<*, State> {
  cell: ?HTMLElement;
  menu: ?HTMLElement;

  state = {
    top: 0,
    left: 0,
  };

  componentDidUpdate() {
    if (!this.cell) return;

    const element = findDOMNode(this.cell);
    if (!(element instanceof HTMLElement)) return;

    const rect = element.getBoundingClientRect();
    const menuWidth = 248;
    const menuHeight = 40;
    const left = Math.round(
      rect.left + window.scrollX + rect.width / 2 - menuWidth / 2
    );
    const top = Math.round(rect.top + window.scrollY - menuHeight - 12);

    this.setState(state => {
      if (state.left !== left || state.top !== top) {
        return { left, top };
      }
    });
  }

  render() {
    const { children, editor, readOnly, attributes, node } = this.props;

    const { document } = editor.value;
    const position = editor.getPositionByKey(document, node.key);
    const isFirstRow = position.isFirstRow();
    const isFirstColumn = position.isFirstColumn();
    const isLastRow = position.isLastRow();
    const isLastColumn = position.isLastColumn();
    const isSelected = node.data.get("selected");
    const isTableSelected = position.table.data.get("selectedTable");
    const isActive = editor.isSelectionInTable() && !isTableSelected;
    const selectedRows = position.table.data.get("selectedRows");
    const selectedColumns = position.table.data.get("selectedColumns");
    const isRowSelected =
      selectedRows && selectedRows.includes(position.getRowIndex());
    const isColumnSelected =
      selectedColumns && selectedColumns.includes(position.getColumnIndex());

    return (
      <StyledTd
        ref={ref => (this.cell = ref)}
        isFirstRow={isFirstRow}
        isFirstColumn={isFirstColumn}
        isSelected={isSelected}
        onClick={
          isSelected ? undefined : () => editor.clearSelected(position.table)
        }
        {...attributes}
      >
        {!readOnly && (
          <React.Fragment>
            {isFirstColumn && isFirstRow && (
              <React.Fragment>
                <GripTable
                  contentEditable={false}
                  isSelected={isTableSelected}
                  onClick={ev => {
                    ev.preventDefault();
                    ev.stopPropagation();

                    if (isTableSelected) {
                      editor.clearSelected(position.table);
                    } else {
                      editor.selectAll().blur();
                    }
                  }}
                />
                <Portal>
                  <Menu active={isTableSelected} style={this.state}>
                    <TableToolbar editor={editor} isTableSelected />
                  </Menu>
                </Portal>
              </React.Fragment>
            )}
            {isFirstColumn && (
              <React.Fragment>
                <GripRow
                  isFirstRow={isFirstRow}
                  isLastRow={isLastRow}
                  isSelected={isRowSelected}
                  contentEditable={false}
                  onClick={ev => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    editor.selectRow(!isSelected || isTableSelected).blur();
                  }}
                />
                {isActive && (
                  <Portal>
                    <Menu active={isRowSelected} style={this.state}>
                      <TableToolbar editor={editor} isRowSelected />
                    </Menu>
                  </Portal>
                )}
              </React.Fragment>
            )}
            {isFirstRow && (
              <React.Fragment>
                <GripColumn
                  isFirstColumn={isFirstColumn}
                  isLastColumn={isLastColumn}
                  isSelected={isColumnSelected}
                  contentEditable={false}
                  onClick={ev => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    editor.selectColumn(!isSelected || isTableSelected).blur();
                  }}
                />
                {isActive && (
                  <Portal>
                    <Menu active={isColumnSelected} style={this.state}>
                      <TableToolbar editor={editor} isColumnSelected />
                    </Menu>
                  </Portal>
                )}
              </React.Fragment>
            )}
          </React.Fragment>
        )}

        <RowContent align={node.data.get("align")}>{children}</RowContent>
      </StyledTd>
    );
  }
}

export const GripTable = styled(Grip)`
  width: 9px;
  height: 9px;
  border-radius: 9px;
  border: 2px solid ${props => props.theme.background};

  position: absolute;
  top: -14px;
  left: -14px;
`;

export const GripRow = styled(Grip)`
  left: -12px;
  top: 0.5px;
  height: 100%;
  width: 8px;
  border-right: 3px solid ${props => props.theme.background};

  ${props =>
    props.isFirstRow &&
    `
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
  `}

  ${props =>
    props.isLastRow &&
    `
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
  `}
`;

export const GripColumn = styled(Grip)`
  top: -12px;
  left: -0.5px;
  width: 100%;
  height: 8px;
  border-bottom: 3px solid ${props => props.theme.background};

  ${props =>
    props.isFirstColumn &&
    `
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
`}

  ${props =>
    props.isLastColumn &&
    `
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
`}
`;

const RowContent = styled.div`
  padding: 4px 8px;
  text-align: ${props => props.align};
`;

const StyledTd = styled.td`
  border-right: 1px solid ${props => props.theme.tableDivider};
  position: relative;
  background: ${props =>
    props.isSelected
      ? props.theme.tableSelectedBackground
      : props.theme.background};

  ${props =>
    props.isFirstRow &&
    `
  box-shadow: 0 1px 1px ${props.theme.tableDivider};
  min-width: 100px;
  `}
`;

export default Cell;
