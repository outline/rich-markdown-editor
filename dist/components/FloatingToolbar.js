"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const resize_observer_polyfill_1 = __importDefault(require("resize-observer-polyfill"));
const React = __importStar(require("react"));
const react_portal_1 = require("react-portal");
const styled_components_1 = __importDefault(require("styled-components"));
const SSR = typeof window === "undefined";
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
        const sizeObserver = new resize_observer_polyfill_1.default(entries => {
            entries.forEach(({ target }) => {
                if (size.width !== target.clientWidth ||
                    size.height !== target.clientHeight) {
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
    const fromPos = view.coordsAtPos(selection.$from.pos);
    const toPos = view.coordsAtPos(selection.$to.pos);
    const selectionBounds = {
        top: Math.min(fromPos.top, toPos.top),
        bottom: Math.max(fromPos.bottom, toPos.bottom),
        left: Math.min(fromPos.left, toPos.left),
        right: Math.max(fromPos.right, toPos.right),
    };
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
    const isImageSelection = selection.node && selection.node.type.name === "image";
    if (isImageSelection) {
        const element = view.nodeDOM(selection.from);
        const imageElement = element.getElementsByTagName("img")[0];
        const { left, top, width } = imageElement.getBoundingClientRect();
        return {
            left: Math.round(left + width / 2 + window.scrollX - menuWidth / 2),
            top: Math.round(top + window.scrollY - menuHeight),
            offset: 0,
            visible: true,
        };
    }
    else {
        const halfSelection = Math.abs(selectionBounds.right - selectionBounds.left) / 2;
        const centerOfSelection = selectionBounds.left + halfSelection;
        const margin = 12;
        const left = Math.min(window.innerWidth - menuWidth - margin, Math.max(margin, centerOfSelection - menuWidth / 2));
        const top = Math.min(window.innerHeight - menuHeight - margin, Math.max(margin, selectionBounds.top - menuHeight));
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
    const menuRef = props.forwardedRef || React.createRef();
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
    return (React.createElement(react_portal_1.Portal, null,
        React.createElement(Wrapper, { active: props.active && position.visible, ref: menuRef, offset: position.offset, style: {
                top: `${position.top}px`,
                left: `${position.left}px`,
            } }, position.visible && props.children)));
}
const Wrapper = styled_components_1.default.div `
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

  ${({ active }) => active &&
    `
    transform: translateY(-6px) scale(1);
    pointer-events: all;
    opacity: 1;
  `};

  @media print {
    display: none;
  }
`;
exports.default = React.forwardRef(function FloatingToolbarWithForwardedRef(props, ref) {
    return React.createElement(FloatingToolbar, Object.assign({}, props, { forwardedRef: ref }));
});
//# sourceMappingURL=FloatingToolbar.js.map