// @flow
import styled from "styled-components";

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.horizontalRule};
`;

export const Row = styled.tr`
  border-bottom: 1px solid ${props => props.theme.horizontalRule};
`;

export const Cell = styled.td`
  border-right: 1px solid ${props => props.theme.horizontalRule};
  padding: 4px;
`;

export default Table;
