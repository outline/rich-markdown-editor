// @flow
import * as React from "react";
import { findDOMNode } from "react-dom";
import styled from "styled-components";
import { GripRow, GripColumn, GripTable } from "./Cell";
import Scrollable from "./Scrollable";

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.tableDivider};
  margin-top: 1em;

  ${GripColumn},
  ${GripRow},
  ${GripTable} {
    opacity: 0;
    transition: opacity 100ms ease-in-out;
  }

  &:hover {
    ${GripColumn},
    ${GripRow},
    ${GripTable} {
      opacity: 1;
    }
  }
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
      <Scrollable>
        <StyledTable ref={ref => (this.table = ref)} {...attributes}>
          <tbody>{children}</tbody>
        </StyledTable>
      </Scrollable>
    );
  }
}

export default Table;
