// @flow
import * as React from "react";
import { Portal } from "react-portal";
import { Editor, findDOMNode } from "slate-react";
import { Node, Value } from "slate";
import styled from "react-emotion";
import { isEqual } from "lodash";
import FormattingToolbar from "./FormattingToolbar";
import LinkToolbar from "./LinkToolbar";

function getLinkInSelection(value): any {
  try {
    const selectedLinks = value.document
      .getInlinesAtRange(value.selection)
      .filter(node => node.type === "link");

    if (selectedLinks.size) {
      const link = selectedLinks.first();
      if (value.selection.hasEdgeIn(link)) return link;
    }
  } catch (err) {
    // It's okay.
  }
}

type Props = {
  editor: Editor,
  value: Value,
};

type State = {
  active: boolean,
  link: ?Node,
  top: string,
  left: string,
  mouseDown: boolean,
};

export default class Toolbar extends React.Component<Props, State> {
  state = {
    active: false,
    mouseDown: false,
    link: undefined,
    top: "",
    left: "",
  };

  menu: HTMLElement;

  componentDidMount = () => {
    this.update();
    window.addEventListener("mousedown", this.handleMouseDown);
    window.addEventListener("mouseup", this.handleMouseUp);
  };

  componentWillUnmount = () => {
    window.removeEventListener("mousedown", this.handleMouseDown);
    window.removeEventListener("mouseup", this.handleMouseUp);
  };

  componentDidUpdate = () => {
    this.update();
  };

  hideLinkToolbar = () => {
    this.setState({ link: undefined });
  };

  handleMouseDown = () => {
    this.setState({ mouseDown: true });
  };

  handleMouseUp = () => {
    this.setState({ mouseDown: false });
  };

  showLinkToolbar = (ev: SyntheticEvent<*>) => {
    ev.preventDefault();
    ev.stopPropagation();

    const link = getLinkInSelection(this.props.value);
    this.setState({ link });
  };

  update = () => {
    const { value } = this.props;
    const link = getLinkInSelection(value);

    if (value.isCollapsed && !link) {
      if (this.state.active) {
        const newState = {
          ...this.state,
          active: false,
          link: undefined,
          top: "",
          left: "",
        };

        if (!isEqual(this.state, newState)) {
          this.setState(newState);
        }
      }
      return;
    }

    let active = true;

    if (!value.startBlock) return;

    // don't display toolbar for document title
    if (value.startBlock.type === "heading1") active = false;

    // don't display toolbar for code blocks, code-lines inline code.
    if (value.startBlock.type.match(/code/)) active = false;

    // don't show until user has released pointing device button
    if (this.state.mouseDown && !link) active = false;

    const newState = {
      ...this.state,
      active,
      link: this.state.link || link,
      top: undefined,
      left: undefined,
    };
    const padding = 16;
    const selection = window.getSelection();
    let rect;

    if (link) {
      rect = findDOMNode(link).getBoundingClientRect();
    } else if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      rect = range.getBoundingClientRect();
    }

    if (!rect || (rect.top === 0 && rect.left === 0)) {
      return;
    }

    const left =
      rect.left + window.scrollX - this.menu.offsetWidth / 2 + rect.width / 2;
    newState.top = `${Math.round(
      rect.top + window.scrollY - this.menu.offsetHeight
    )}px`;
    newState.left = `${Math.round(Math.max(padding, left))}px`;

    if (!isEqual(this.state, newState)) {
      this.setState(newState);
    }
  };

  setRef = (ref: HTMLElement) => {
    this.menu = ref;
  };

  render() {
    const style = {
      top: this.state.top,
      left: this.state.left,
    };

    return (
      <Portal>
        <Menu active={this.state.active} innerRef={this.setRef} style={style}>
          {this.state.link ? (
            <LinkToolbar
              {...this.props}
              link={this.state.link}
              onBlur={this.hideLinkToolbar}
            />
          ) : (
            <FormattingToolbar
              onCreateLink={this.showLinkToolbar}
              {...this.props}
            />
          )}
        </Menu>
      </Portal>
    );
  }
}

const Menu = styled.div`
  padding: 8px 16px;
  position: absolute;
  z-index: 2;
  top: -10000px;
  left: -10000px;
  opacity: 0;
  background-color: ${props => props.theme.toolbarBackground};
  border-radius: 4px;
  transform: scale(0.95);
  transition: opacity 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275),
    transform 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transition-delay: 250ms;
  line-height: 0;
  height: 40px;
  min-width: 300px;
  box-sizing: border-box;
  pointer-events: none;

  * {
    box-sizing: border-box;
  }

  ${({ active }) =>
    active &&
    `
    transform: translateY(-6px) scale(1);
    pointer-events: all;
    opacity: 1;
  `};

  @media print {
    display: none;
  }
`;
