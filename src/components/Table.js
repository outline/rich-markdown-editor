// @flow
import * as React from "react";
import { PlusIcon } from "outline-icons";
import styled from "styled-components";

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.horizontalRule};
  box-shadow: 0 -4px 0 rgba(0, 0, 0, 0.04), -4px 0 0 rgba(0, 0, 0, 0.04);
`;

class Table extends React.Component<*> {
  componentDidMount = () => {
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", this.handleMouseMove);
    }
  };

  componentWillUnmount = () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("mousemove", this.handleMouseMove);
    }
  };

  handleMouseMove = (ev: SyntheticMouseEvent<*>) => {
    // TODO
  };

  render() {
    const { children, ...rest } = this.props;

    return (
      <StyledTable {...rest}>
        <tbody>{children}</tbody>
      </StyledTable>
    );
  }
}

const InsertRowPositioner = styled.div`
  position: relative;
  width: 0;
  height: 0;
`;

const InsertRow = styled.div`
  padding: 4px;
  position: absolute;
  left: -24px;
  top: 20px;
`;

const StyledTr = styled.tr`
  position: relative;
  border-bottom: 1px solid ${props => props.theme.horizontalRule};

  ${InsertRowPositioner} {
    visibility: hidden;
  }

  &:hover {
    ${InsertRowPositioner} {
      visibility: visible;
    }
  }
`;

export const Row = ({ children, editor, attributes, ...rest }: *) => {
  return (
    <StyledTr {...attributes}>
      <InsertRowPositioner>
        <InsertRow
          onClick={ev => {
            ev.preventDefault();
            editor.insertRow();
          }}
        >
          <PlusIcon />
        </InsertRow>
      </InsertRowPositioner>
      {children}
    </StyledTr>
  );
};

export const StyledTd = styled.td`
  text-align: ${props => props.align};
  border-right: 1px solid ${props => props.theme.horizontalRule};
  padding: 4px 8px;
`;

export const Cell = ({ children, editor, attributes, node, ...rest }: *) => {
  const { document } = editor.value;
  const position = editor.getPositionByKey(document, node.key);
  const isHead = position.isFirstRow();

  return (
    <StyledTd align={node.data.get("align")} {...attributes}>
      {isHead && (
        <React.Fragment>
          <span
            onClick={ev => {
              editor.moveSelection(
                position.getColumnIndex(),
                position.getRowIndex()
              );
              editor.setColumnAlign("left");
            }}
          >
            left
          </span>{" "}
          <span
            onClick={ev => {
              editor.moveSelection(
                position.getColumnIndex(),
                position.getRowIndex()
              );
              editor.setColumnAlign("center");
            }}
          >
            center
          </span>{" "}
          <span
            onClick={ev => {
              editor.moveSelection(
                position.getColumnIndex(),
                position.getRowIndex()
              );
              editor.setColumnAlign("right");
            }}
          >
            right
          </span>
        </React.Fragment>
      )}

      {children}
    </StyledTd>
  );
};

export default Table;
