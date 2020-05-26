import * as React from "react";
import { Portal } from "react-portal";
import { EditorView } from "prosemirror-view";
import styled from "styled-components";

const SSR = typeof window === "undefined";

type Props = {
  isActive: boolean;
  view: EditorView;
  children: React.ReactNode;
};

export default class SelectionToolbar extends React.Component<Props> {
  menuRef = React.createRef<HTMLDivElement>();

  state = {
    left: -1000,
    top: undefined,
  };

  componentDidUpdate(prevProps) {
    if (!prevProps.isActive && this.props.isActive) {
      const position = this.calculatePosition(this.props);
      this.setState(position);
    }
  }

  calculatePosition(props) {
    const { view } = props;
    const { selection } = view.state;
    const { offsetHeight } = this.menuRef.current;
    const paragraph = view.domAtPos(selection.$from.pos);

    if (!props.isActive || !paragraph.node || SSR) {
      return {
        left: -1000,
        top: 0,
      };
    }

    const { top, left } = paragraph.node.getBoundingClientRect();

    return {
      left: left + window.scrollX,
      top: top + window.scrollY - offsetHeight,
    };
  }

  render() {
    const { children, isActive } = this.props;

    console.log(this.state);

    return (
      <Portal>
        <Wrapper
          active={isActive}
          ref={this.menuRef}
          top={this.state.top}
          left={this.state.left}
        >
          {children}
        </Wrapper>
      </Portal>
    );
  }
}

const Wrapper = styled.div<{
  active: boolean;
  top: number;
  left: number;
}>`
  padding: 8px 16px;
  position: absolute;
  z-index: ${props => {
    return props.theme.zIndex + 100;
  }};
  top: ${props => props.top}px;
  left: ${props => props.left}px;
  opacity: 0;
  background-color: ${props => props.theme.toolbarBackground};
  border-radius: 4px;
  transform: scale(0.95);
  transition: opacity 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275),
    transform 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transition-delay: 150ms;
  line-height: 0;
  height: 40px;
  box-sizing: border-box;
  pointer-events: none;
  white-space: nowrap;

  &::before {
    content: "";
    display: block;
    width: 24px;
    height: 24px;
    transform: translateX(-50%) rotate(45deg);
    background: ${props => props.theme.toolbarBackground};
    border-radius: 3px;
    z-index: -1;
    position: absolute;
    bottom: -2px;
  }

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
