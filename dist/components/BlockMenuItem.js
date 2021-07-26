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
const React = __importStar(require("react"));
const smooth_scroll_into_view_if_needed_1 = __importDefault(require("smooth-scroll-into-view-if-needed"));
const styled_components_1 = __importStar(require("styled-components"));
const theme_1 = __importDefault(require("../theme"));
function BlockMenuItem({ selected, disabled, onClick, title, shortcut, icon, }) {
    const Icon = icon;
    const ref = React.useCallback(node => {
        if (selected && node) {
            smooth_scroll_into_view_if_needed_1.default(node, {
                scrollMode: "if-needed",
                block: "center",
                boundary: parent => {
                    return parent.id !== "block-menu-container";
                },
            });
        }
    }, [selected]);
    return (React.createElement(MenuItem, { selected: selected, onClick: disabled ? undefined : onClick, ref: ref },
        React.createElement(Icon, { color: selected ? theme_1.default.blockToolbarIconSelected : theme_1.default.blockToolbarIcon }),
        "\u00A0\u00A0",
        title,
        React.createElement(Shortcut, null, shortcut)));
}
const MenuItem = styled_components_1.default.button `
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-weight: 500;
  font-size: 14px;
  line-height: 1;
  width: 100%;
  height: 36px;
  cursor: pointer;
  border: none;
  opacity: ${props => (props.disabled ? ".5" : "1")};
  color: ${props => props.selected
    ? props.theme.blockToolbarTextSelected
    : props.theme.blockToolbarText};
  background: ${props => props.selected ? props.theme.blockToolbarTrigger : "none"};
  padding: 0 16px;
  outline: none;

  &:hover,
  &:active {
    color: ${props => props.theme.blockToolbarTextSelected};
    background: ${props => props.selected
    ? props.theme.blockToolbarTrigger
    : props.theme.blockToolbarHoverBackground};
  }
`;
const Shortcut = styled_components_1.default.span `
  color: ${props => props.theme.textSecondary};
  flex-grow: 1;
  text-align: right;
`;
exports.default = styled_components_1.withTheme(BlockMenuItem);
//# sourceMappingURL=BlockMenuItem.js.map