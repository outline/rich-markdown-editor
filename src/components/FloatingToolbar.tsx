import ResizeObserver from "resize-observer-polyfill";
import * as React from "react";
import { Portal } from "react-portal";
import { EditorView } from "prosemirror-view";
import styled from "styled-components";

const SSR = typeof window === "undefined";

type Props = {
  active?: boolean;
  view: EditorView;
  children: React.ReactNode;
  forwardedRef?: React.RefObject<HTMLDivElement> | null;
};

const defaultPosition = {
  left: -1000,
  top: 0,
  offset: 0,
  visible: false,
};

const useComponentSize = ref => {
  const [size, setSize] = React.useState({
    width: 0,
    height: 0,
  });

  React.useEffect(() => {
    const sizeObserver = new ResizeObserver(entries => {
      entries.forEach(({ target }) => {
        if (
          size.width !== target.clientWidth ||
          size.height !== target.clientHeight
        ) {
          setSize({ width: target.clientWidth, height: target.clientHeight });
        }
      });
    });
    sizeObserver.observe(ref.current);

    return () => sizeObserver.disconnect();
  }, [ref]);

  return size;
};

function usePosition({ menuRef, isSelectingText, props }) {
  const { view, active } = props;
  const { selection } = view.state;
  const { width: menuWidth, height: menuHeight } = useComponentSize(menuRef);

  if (!active || !menuWidth || !menuHeight || SSR || isSelectingText) {
    return defaultPosition;
  }

  // based on the start and end of the selection calculate the position at
  // the center top
  const fromPos = view.coordsAtPos(selection.$from.pos);
  const toPos = view.coordsAtPos(selection.$to.pos);

  // ensure that start < end for the menu to be positioned correctly
  const selectionBounds = {
    top: Math.min(fromPos.top, toPos.top),
    bottom: Math.max(fromPos.bottom, toPos.bottom),
    left: Math.min(fromPos.left, toPos.left),
    right: Math.max(fromPos.right, toPos.right),
  };

  // tables are an oddity, and need their own positioning logic
  const isColSelection = selection.isColSelection && selection.isColSelection();
  const isRowSelection = selection.isRowSelection && selection.isRowSelection();

  if (isColSelection) {
    const { node: element } = view.domAtPos(selection.$from.pos);
    const { width } = element.getBoundingClientRect();
    selectionBounds.top -= 20;
    selectionBounds.right = selectionBounds.left + width;
  }

  if (isRowSelection) {
    selectionBounds.right = selectionBounds.left = selectionBounds.left - 18;
  }

  const isImageSelection =
    selection.node && selection.node.type.name === "image";
  // Images need their own positioning to get the toolbar in the center
  if (isImageSelection) {
    const element = view.nodeDOM(selection.from);

    // Images are wrapped which impacts positioning - need to traverse through
    // p > span > div.image
    const imageElement = element.getElementsByTagName("img")[0];
    const { left, top, width } = imageElement.getBoundingClientRect();

    return {
      left: Math.round(left + width / 2 + window.scrollX - menuWidth / 2),
      top: Math.round(top + window.scrollY - menuHeight),
      offset: 0,
      visible: true,
    };
  } else {
    // calcluate the horizontal center of the selection
    const halfSelection =
      Math.abs(selectionBounds.right - selectionBounds.left) / 2;
    const centerOfSelection = selectionBounds.left + halfSelection;

    // position the menu so that it is centered over the selection except in
    // the cases where it would extend off the edge of the screen. In these
    // instances leave a margin
    const margin = 12;
    const left = Math.min(
      window.innerWidth - menuWidth - margin,
      Math.max(margin, centerOfSelection - menuWidth / 2)
    );
    const top = Math.min(
      window.innerHeight - menuHeight - margin,
      Math.max(margin, selectionBounds.top - menuHeight)
    );

    // if the menu has been offset to not extend offscreen then we should adjust
    // the position of the triangle underneath to correctly point to the center
    // of the selection still
    const offset = left - (centerOfSelection - menuWidth / 2);
    return {
      left: Math.round(left + window.scrollX),
      top: Math.round(top + window.scrollY),
      offset: Math.round(offset),
      visible: true,
    };
  }
}

function FloatingToolbar(props) {
  const menuRef = props.forwardedRef || React.createRef<HTMLDivElement>();
  const [isSelectingText, setSelectingText] = React.useState(false);
  const position = usePosition({
    menuRef,
    isSelectingText,
    props,
  });

  React.useEffect(() => {
    const handleMouseDown = () => {
      if (!props.active) {
        setSelectingText(true);
      }
    };

    const handleMouseUp = () => {
      setSelectingText(false);
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [props.active]);

  // only render children when state is updated to visible
  // to prevent gaining input focus before calculatePosition runs
  return (
    <Portal>
      <Wrapper
        active={props.active && position.visible}
        ref={menuRef}
        offset={position.offset}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        {position.visible && props.children}
      </Wrapper>
    </Portal>
  );
}

const Wrapper = styled.div<{
  active?: boolean;
  offset: number;
}>`
  will-change: opacity, transform;
  padding: 8px 16px;
  position: absolute;
  z-index: ${props => props.theme.zIndex + 100};
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

export default React.forwardRef(function FloatingToolbarWithForwardedRef(
  props: Props,
  ref: React.RefObject<HTMLDivElement>
) {
  return <FloatingToolbar {...props} forwardedRef={ref} />;
});
