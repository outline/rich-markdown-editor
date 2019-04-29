// @flow
import * as React from "react";
import styled from "styled-components";

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.horizontalRule};
  box-shadow: 0 -4px 0 rgba(0, 0, 0, 0.04), -4px 0 0 rgba(0, 0, 0, 0.04);
`;

const TableWithBody = ({ children, ...rest }: *) => {
  return (
    <Table {...rest}>
      <tbody>{children}</tbody>
    </Table>
  );
};

export const Row = styled.tr`
  border-bottom: 1px solid ${props => props.theme.horizontalRule};
`;

export const Cell = styled.td`
  border-right: 1px solid ${props => props.theme.horizontalRule};
  padding: 4px 8px;
`;

export default TableWithBody;
