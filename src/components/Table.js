// @flow
import * as React from "react";
import styled from "styled-components";

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.horizontalRule};
  box-shadow: 0 -4px 0 rgba(0, 0, 0, 0.04), -4px 0 0 rgba(0, 0, 0, 0.04);
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

export const StyledTd = styled.td`
  text-align: ${props => props.align};
  border-right: 1px solid ${props => props.theme.horizontalRule};
  padding: 4px 8px;

  ${props =>
    props.isHead &&
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
  const position = editor.getPositionByKey(document, node.key);
  const isHead = position.isFirstRow();

  return (
    <StyledTd align={node.data.get("align")} isHead={isHead} {...attributes}>
      {children}
    </StyledTd>
  );
};

export default Table;
