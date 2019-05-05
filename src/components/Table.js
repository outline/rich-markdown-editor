// @flow
import * as React from "react";
import styled from "styled-components";

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.horizontalRule};
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

const StyledTr = styled.tr`
  position: relative;
  border-bottom: 1px solid ${props => props.theme.horizontalRule};
`;

const Grip = styled.a`
  position: absolute;
  background: ${props => props.theme.horizontalRule};
  opacity: ${props => (props.isActive ? 1 : 0)}
  transition: opacity 100ms ease-in-out;
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.primary};
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
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
  `}

  ${props =>
    props.isLastRow &&
    `
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
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
  border-top-left-radius: 2px;
  border-bottom-left-radius: 2px;
`}

  ${props =>
    props.isLastColumn &&
    `
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
`}
`;

const RowContent = styled.div`
  padding: 4px 8px;
  text-align: ${props => props.align};
`;

export const StyledTd = styled.td`
  border-right: 1px solid ${props => props.theme.horizontalRule};
  position: relative;

  ${props =>
    props.isFirstRow &&
    `
  background: ${props.theme.background};
  box-shadow: 0 1px 1px ${props.theme.horizontalRule};
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

  return (
    <StyledTd
      isFirstRow={isFirstRow}
      isFirstColumn={isFirstColumn}
      {...attributes}
    >
      {!readOnly && (
        <React.Fragment>
          {isFirstColumn && (
            <GripRow
              isFirstRow={isFirstRow}
              isLastRow={isLastRow}
              isActive={isActive}
              contentEditable={false}
            />
          )}
          {isFirstRow && (
            <GripColumn
              isFirstColumn={isFirstColumn}
              isLastColumn={isLastColumn}
              isActive={isActive}
              contentEditable={false}
            />
          )}
        </React.Fragment>
      )}

      <RowContent align={node.data.get("align")}>{children}</RowContent>
    </StyledTd>
  );
};

export default Table;
