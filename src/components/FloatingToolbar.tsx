import * as React from "react";
import { Portal } from "react-portal";
import { isEqual } from "lodash";
import { EditorView } from "prosemirror-view";
import styled from "styled-components";

const SSR = typeof window === "undefined";

type Props = {
  active?: boolean;
  view: EditorView;
  children: React.ReactNode;
  forwardedRef?: React.RefObject<HTMLDivElement> | null;
};

class FloatingToolbar extends React.Component<Props> {
  menuRef = this.props.forwardedRef || React.createRef<HTMLDivElement>();

  state = {
    left: -1000,
    top: 0,
    offset: 0,
    visible: false,
    isSelectingText: false,
  };

  componentDidMount() {
    window.addEventListener("mousedown", this.handleMouseDown);
    window.addEventListener("mouseup", this.handleMouseUp);
  }

  componentDidUpdate() {
    const newState = this.calculatePosition(this.props);

    if (!isEqual(newState, this.state)) {
      this.setState(newState);
    }
  }

  componentWillUnmount() {
    window.removeEventListener("mousedown", this.handleMouseDown);
    window.removeEventListener("mouseup", this.handleMouseUp);
  }

  handleMouseDown = () => {
    if (!this.props.active) {
      this.setState(state => ({ ...state, isSelectingText: true }));
    }
  };

  handleMouseUp = () => {
    this.setState(state => ({ ...state, isSelectingText: false }));
  };

  calculatePosition(props) {
    const { view, active } = props;
    const { selection } = view.state;

    if (!active || !this.menuRef.current || SSR || this.state.isSelectingText) {
      return {
        left: -1000,
        top: 0,
        offset: 0,
        visible: false,
        isSelectingText: this.state.isSelectingText,
      };
    }

    // based on the start and end of the selection calculate the position at
    // the center top
    const startPos = view.coordsAtPos(selection.$from.pos);
    const endPos = view.coordsAtPos(selection.$to.pos);

    // tables are an oddity, and need their own logic
    const isColSelection =
      selection.isColSelection && selection.isColSelection();
    const isRowSelection =
      selection.isRowSelection && selection.isRowSelection();

    if (isRowSelection) {
      endPos.left = startPos.left + 12;
    } else if (isColSelection) {
      const { node: element } = view.domAtPos(selection.$from.pos);
      const { width } = element.getBoundingClientRect();
      endPos.left = startPos.left + width;
    }

    const halfSelection = Math.abs(endPos.left - startPos.left) / 2;
    const centerOfSelection = startPos.left + halfSelection;

    // position the menu so that it is centered over the selection except in
    // the cases where it would extend off the edge of the screen. In these
    // instances leave a margin
    const { offsetWidth, offsetHeight } = this.menuRef.current;
    const margin = 12;
    const left = Math.min(
      window.innerWidth - offsetWidth - margin,
      Math.max(margin, centerOfSelection - offsetWidth / 2)
    );
    const top = Math.min(
      window.innerHeight - offsetHeight - margin,
      Math.max(margin, startPos.top - offsetHeight)
    );

    // if the menu has been offset to not extend offscreen then we should adjust
    // the position of the triangle underneath to correctly point to the center
    // of the selection still
    const offset = Math.round(left - (centerOfSelection - offsetWidth / 2));

    return {
      left: Math.round(left + window.scrollX),
      top: Math.round(top + window.scrollY),
      offset,
      visible: true,
      isSelectingText: this.state.isSelectingText,
    };
  }

  render() {
    const { children, active } = this.props;

    // only render children when state is updated to visible
    // to prevent gaining input focus before calculatePosition runs
    return (
      <Portal>
        <Wrapper
          active={active && this.state.visible}
          ref={this.menuRef}
          offset={this.state.offset}
          style={{
            top: `${this.state.top}px`,
            left: `${this.state.left}px`,
          }}
        >
          {this.state.visible && children}
        </Wrapper>
      </Portal>
    );
  }
}

const Wrapper = styled.div<{
  active?: boolean;
  offset: number;
}>`
  padding: 8px 16px;
  position: absolute;
  z-index: ${props => props.theme.zIndex + 9999};
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
    left: calc(50% - ${props => props.offset || 0}px);
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

export default React.forwardRef(
  (props: Props, ref: React.RefObject<HTMLDivElement>) => (
    <FloatingToolbar {...props} forwardedRef={ref} />
  )
);
