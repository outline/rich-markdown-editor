// @flow
import * as React from "react";
import styled from "styled-components";
import Toolbar from "./Toolbar";
import Grip from "./Grip";

class Cell extends React.Component<*> {
  cell: ?HTMLElement;

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
        onClick={() => editor.clearSelected(position.table)}
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
                <Toolbar
                  editor={editor}
                  cell={this.cell}
                  active={isTableSelected}
                  type="table"
                />
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
                  <Toolbar
                    editor={editor}
                    cell={this.cell}
                    active={isRowSelected}
                    type="row"
                  />
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
                  <Toolbar
                    editor={editor}
                    cell={this.cell}
                    active={isColumnSelected}
                    type="column"
                  />
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
  vertical-align: top;
  border-right: 1px solid ${props => props.theme.tableDivider};
  position: relative;
  background: ${props =>
    props.isSelected
      ? props.theme.tableSelectedBackground
      : props.theme.background};

  ${props =>
    props.isFirstRow &&
    `
  min-width: 100px;
  `}
`;

export default Cell;
