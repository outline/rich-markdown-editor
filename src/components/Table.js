// @flow
import * as React from "react";
import { Portal } from "react-portal";
import { findDOMNode } from "react-dom";
import styled from "styled-components";
import { PlusIcon } from "outline-icons";
import TableToolbar from "./Toolbar/TableToolbar";
import { Menu } from "./Toolbar";

const StyledTr = styled.tr`
  position: relative;
  border-bottom: 1px solid ${props => props.theme.tableDivider};
`;

const Grip = styled.a`
  position: absolute;
  cursor: pointer;
  background: ${props =>
    props.isSelected ? props.theme.tableSelected : props.theme.tableDivider};

  ${props => props.isSelected && "opacity: 1 !important;"}

  &:hover {
    background: ${props => props.theme.tableSelected};
  }
`;

const GripRow = styled(Grip)`
  left: -12px;
  top: 0.5px;
  height: 100%;
  width: 8px;

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

const GripColumn = styled(Grip)`
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

const PlusButton = styled.button`
  position: absolute;
  border: 0;
  background: 0;
  padding: 0;
  border-radius: 24px;
  top: -32px;
  left: -12px;
  width: 24px;
  height: 24px;

  ${props => props.right && "right: 0;"}
`;

const RowContent = styled.div`
  padding: 4px 8px;
  text-align: ${props => props.align};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.tableDivider};
  margin-top: 1em;
  margin-left: 1em;

  ${PlusButton},
  ${GripColumn},
  ${GripRow} {
    opacity: 0;
    transition: opacity 100ms ease-in-out;
  }

  &:hover {
    ${PlusButton},
    ${GripColumn},
    ${GripRow} {
      opacity: 1;
    }
  }
`;

const TableShadows = styled.div`
  position: relative;

  &::after {
    content: "";
    height: 100%;
    width: 0;
    border-right: 1px solid ${props => props.theme.tableDivider};
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 1;
  }

  &::before {
    content: "";
    height: 100%;
    width: 0;
    border-right: 1px solid ${props => props.theme.tableDivider};
    display: block;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 1;
  }
`;

const TableWrapper = styled.div`
  overflow-x: scroll;
`;

class Table extends React.Component<*> {
  table: HTMLTableElement;

  componentDidMount() {
    if (typeof window !== "undefined") {
      window.addEventListener("click", this.handleOutsideMouseClick);
    }
  }

  componentWillUnmount() {
    if (typeof window !== "undefined") {
      window.removeEventListener("click", this.handleOutsideMouseClick);
    }
  }

  handleOutsideMouseClick = (ev: SyntheticMouseEvent<*>) => {
    const element = findDOMNode(this.table);

    if (
      !element ||
      (ev.target instanceof Node && element.contains(ev.target))
    ) {
      return;
    }

    this.props.editor.clearSelected(this.props.node);
  };

  render() {
    const { children, attributes } = this.props;

    return (
      <TableShadows>
        <TableWrapper>
          <StyledTable ref={ref => (this.table = ref)} {...attributes}>
            <tbody>{children}</tbody>
          </StyledTable>
        </TableWrapper>
      </TableShadows>
    );
  }
}

export const StyledTd = styled.td`
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

export const Row = ({ children, editor, attributes, node, ...rest }: *) => {
  return <StyledTr {...attributes}>{children}</StyledTr>;
};

export class Cell extends React.Component<*> {
  cell: ?HTMLElement;
  menu: ?HTMLElement;

  state = {
    top: 0,
    left: 0,
  };

  componentDidUpdate() {
    if (!this.cell) return;

    const rect = findDOMNode(this.cell).getBoundingClientRect();
    const menuWidth = 238;
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
    const isActive = editor.isSelectionInTable();
    const position = editor.getPositionByKey(document, node.key);
    const isFirstRow = position.isFirstRow();
    const isFirstColumn = position.isFirstColumn();
    const isLastRow = position.isLastRow();
    const isLastColumn = position.isLastColumn();
    const isSelected = node.data.get("selected");
    const isSelectedColumn =
      position.table.data.get("selectedColumn") === position.getColumnIndex();

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
            {isFirstColumn && (
              <GripRow
                isFirstRow={isFirstRow}
                isLastRow={isLastRow}
                isActive={isActive}
                isSelected={
                  position.table.data.get("selectedRow") ===
                  position.getRowIndex()
                }
                contentEditable={false}
                onClick={ev => {
                  ev.preventDefault();
                  ev.stopPropagation();
                  editor.selectRow(!isSelected);
                }}
              />
            )}
            {isFirstRow && (
              <React.Fragment>
                <GripColumn
                  isFirstColumn={isFirstColumn}
                  isLastColumn={isLastColumn}
                  isActive={isActive}
                  isSelected={isSelectedColumn}
                  contentEditable={false}
                  onClick={ev => {
                    ev.preventDefault();
                    ev.stopPropagation();

                    editor.selectColumn(!isSelected);
                  }}
                />
                {isActive && (
                  <Portal>
                    <Menu active={isSelectedColumn} style={this.state}>
                      <TableToolbar editor={editor} />
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

export default Table;
