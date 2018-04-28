// @flow
import * as React from "react";
import { Portal } from "react-portal";
import { Node } from "slate";
import { Editor, findDOMNode } from "slate-react";
import { isEqual } from "lodash";
import styled from "styled-components";
import { PlusIcon } from "outline-icons";

type Props = {
  editor: Editor,
};

function findClosestRootNode(value, ev) {
  let previous;

  for (const node of value.document.nodes) {
    const element = findDOMNode(node);
    const bounds = element.getBoundingClientRect();
    if (bounds.top > ev.clientY) return previous;
    previous = { node, element, bounds };
  }

  return previous;
}

type State = {
  closestRootNode: ?Node,
  active: boolean,
  top: number,
  left: number,
};

export default class BlockInsert extends React.Component<Props, State> {
  mouseMoveTimeout: ?TimeoutID;
  mouseMovementSinceClick: number = 0;
  lastClientX: number = 0;
  lastClientY: number = 0;
  state = {
    top: 0,
    left: 0,
    active: false,
    closestRootNode: undefined,
  };

  componentDidMount = () => {
    window.addEventListener("mousemove", this.handleMouseMove);
  };

  componentWillUnmount = () => {
    window.removeEventListener("mousemove", this.handleMouseMove);
  };

  setInactive = () => {
    this.setState({ active: false });
  };

  handleMouseMove = (ev: SyntheticMouseEvent<*>) => {
    const windowWidth = window.innerWidth / 2.5;
    const result = findClosestRootNode(this.props.editor.value, ev);
    const movementThreshold = 200;
    const newState = this.state;

    this.mouseMovementSinceClick +=
      Math.abs(this.lastClientX - ev.clientX) +
      Math.abs(this.lastClientY - ev.clientY);
    this.lastClientX = ev.clientX;
    this.lastClientY = ev.clientY;

    newState.active =
      ev.clientX < windowWidth &&
      this.mouseMovementSinceClick > movementThreshold;

    if (result) {
      newState.closestRootNode = result.node;

      // do not show block menu on title heading or editor
      const firstNode = this.props.editor.value.document.nodes.first();
      const hideToolbar =
        result.node === firstNode ||
        result.node.type === "block-toolbar" ||
        !!result.node.text.trim();

      if (hideToolbar) {
        newState.left = -1000;
      } else {
        newState.left = Math.round(result.bounds.left - 20);
        newState.top = Math.round(result.bounds.top + window.scrollY);
      }
    }

    if (this.state.active) {
      if (this.mouseMoveTimeout) clearTimeout(this.mouseMoveTimeout);
      this.mouseMoveTimeout = setTimeout(this.setInactive, 2000);
    }

    if (!isEqual(newState, this.state)) {
      console.log(newState, this.state);
      this.setState(newState);
    }
  };

  handleClick = (ev: SyntheticMouseEvent<*>) => {
    ev.preventDefault();
    ev.stopPropagation();

    this.mouseMovementSinceClick = 0;
    this.setState({ active: false });

    const { editor } = this.props;

    editor.change(change => {
      // remove any existing toolbars in the document as a fail safe
      editor.value.document.nodes.forEach(node => {
        if (node.type === "block-toolbar") {
          change.removeNodeByKey(node.key);
        }
      });

      const node = this.state.closestRootNode;
      if (!node) return;

      change.collapseToStartOf(node);

      // if we're on an empty paragraph then just replace it with the block
      // toolbar. Otherwise insert the toolbar as an extra Node.
      if (!node.text.trim() && node.type === "paragraph") {
        change.setNodeByKey(node.key, {
          type: "block-toolbar",
          isVoid: true,
        });
      }
    });
  };

  render() {
    const style = { top: `${this.state.top}px`, left: `${this.state.left}px` };

    return (
      <Portal>
        <Trigger active={this.state.active} style={style}>
          <PlusIcon onClick={this.handleClick} />
        </Trigger>
      </Portal>
    );
  }
}

const Trigger = styled.div`
  position: absolute;
  z-index: 1;
  opacity: 0;
  background-color: ${props => props.theme.white};
  transition: opacity 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275),
    transform 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  line-height: 0;
  margin-left: -10px;
  box-shadow: inset 0 0 0 2px ${props => props.theme.slate};
  border-radius: 100%;
  transform: scale(0.9);
  cursor: pointer;

  &:hover {
    background-color: ${props => props.theme.slate};

    svg {
      fill: ${props => props.theme.white};
    }
  }

  ${({ active }) =>
    active &&
    `
    transform: scale(1);
    opacity: .9;
  `};
`;
