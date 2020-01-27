import * as React from "react";
import { EditorView } from "prosemirror-view";
import styled from "styled-components";
import Menu from "./Menu";

type Props = {
  tooltip: React.Component;
  commands: Record<string, any>;
  view: EditorView;
};

export default class FloatingToolbar extends React.Component<Props> {
  menuRef = React.createRef<HTMLDivElement>();
  state = {
    style: {
      left: 0,
      top: 0,
    },
  };

  componentDidMount() {
    this.setState({
      style: this.calculateStyle(this.props),
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      style: this.calculateStyle(nextProps),
    });
  }

  calculateStyle(props) {
    const { view } = props;

    const { selection } = view.state;

    if (!selection || selection.empty) {
      return {
        left: -1000,
        top: 0,
      };
    }

    const anchorPos = view.coordsAtPos(selection.$anchor.pos);
    const headPos = view.coordsAtPos(selection.$head.pos);
    const halfSelection = Math.abs(anchorPos.left - headPos.left) / 2;
    let centerOfSelection;

    if (anchorPos.left > headPos.left) {
      centerOfSelection = headPos.left + halfSelection;
    } else {
      centerOfSelection = anchorPos.left + halfSelection;
    }

    const { offsetWidth, offsetHeight } = this.menuRef.current;
    const margin = 12;
    const left = Math.min(
      window.innerWidth - offsetWidth - margin,
      Math.max(margin, centerOfSelection - offsetWidth / 2)
    );
    const top = Math.min(
      window.innerHeight - offsetHeight - margin,
      Math.max(margin, anchorPos.top - offsetHeight)
    );

    return {
      left,
      top,
    };
  }

  render() {
    const { view } = this.props;
    const isActive = !view.state.selection.empty;

    return (
      <Wrapper active={isActive} ref={this.menuRef} style={this.state.style}>
        <Menu {...this.props} />
      </Wrapper>
    );
  }
}

export const Wrapper = styled.div<{ active: boolean }>`
  padding: 8px 16px;
  position: absolute;
  z-index: ${props => {
    return props.theme.zIndex + 100;
  }};
  top: -10000px;
  left: -10000px;
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
    left: 50%;
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
