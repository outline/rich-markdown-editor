// @flow
import * as React from "react";
import styled from "react-emotion";

import type { SlateNodeProps as Props } from "../types";

export default class TodoItem extends React.Component<Props> {
  handleChange = (ev: SyntheticInputEvent<*>) => {
    const checked = ev.target.checked;
    const { editor, node } = this.props;
    editor.change(change =>
      change.setNodeByKey(node.key, { data: { checked } })
    );
  };

  render() {
    const { children, node, attributes, readOnly } = this.props;
    const checked = node.data.get("checked");

    return (
      <ListItem checked={checked} {...attributes}>
        <span contentEditable={false}>
          <Input
            type="checkbox"
            checked={checked}
            onChange={this.handleChange}
            disabled={readOnly}
          />
        </span>

        {children}
      </ListItem>
    );
  }
}

const ListItem = styled.li`
  padding-left: 1.4em;
  position: relative;

  > p > span {
    color: ${props => (props.checked ? props.theme.textSecondary : "inherit")};
    text-decoration: ${props => (props.checked ? "line-through" : "none")};
  }
`;

const Input = styled.input`
  position: absolute;
  left: 0;
  top: 0.4em;
`;
