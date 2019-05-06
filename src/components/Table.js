// @flow
import * as React from "react";
import styled from "styled-components";

const StyledTr = styled.tr`
  position: relative;
  border-bottom: 1px solid ${props => props.theme.tableDivider};
`;

const Grip = styled.a`
  position: absolute;
  opacity: ${props => (props.isActive ? 1 : 0)}
  transition: opacity 100ms ease-in-out;
  cursor: pointer;
  background: ${props =>
    props.isSelected ? props.theme.tableSelected : props.theme.tableDivider};

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

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.tableDivider};
`;

class Table extends React.Component<*> {
  render() {
    const { children, ...rest } = this.props;

    return (
      <StyledTable {...rest}>
        <tbody>{children}</tbody>
      </StyledTable>
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
  z-index: 1;
  position: sticky;
  top: -1px;
  `}
`;

export const Row = ({ children, editor, attributes, node, ...rest }: *) => {
  return <StyledTr {...attributes}>{children}</StyledTr>;
};

export const Cell = ({
  children,
  editor,
  readOnly,
  attributes,
  node,
  ...rest
}: *) => {
  const { document } = editor.value;
  const isActive = editor.isSelectionInTable();
  const position = editor.getPositionByKey(document, node.key);
  const isFirstRow = position.isFirstRow();
  const isFirstColumn = position.isFirstColumn();
  const isLastRow = position.isLastRow();
  const isLastColumn = position.isLastColumn();
  const isSelected = node.data.get("selected");

  return (
    <StyledTd
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
            <GripColumn
              isFirstColumn={isFirstColumn}
              isLastColumn={isLastColumn}
              isActive={isActive}
              isSelected={
                position.table.data.get("selectedColumn") ===
                position.getColumnIndex()
              }
              contentEditable={false}
              onClick={ev => {
                ev.preventDefault();
                ev.stopPropagation();

                editor.selectColumn(!isSelected);
              }}
            />
          )}
        </React.Fragment>
      )}

      <RowContent align={node.data.get("align")}>{children}</RowContent>
    </StyledTd>
  );
};

export default Table;
