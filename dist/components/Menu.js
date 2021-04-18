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
const styled_components_1 = __importStar(require("styled-components"));
const ToolbarButton_1 = __importDefault(require("./ToolbarButton"));
const ToolbarSeparator_1 = __importDefault(require("./ToolbarSeparator"));
const FlexibleWrapper = styled_components_1.default.div `
  display: flex;
`;
class Menu extends React.Component {
    render() {
        const { view, items } = this.props;
        const { state } = view;
        const Tooltip = this.props.tooltip;
        return (React.createElement(FlexibleWrapper, null, items.map((item, index) => {
            if (item.name === "separator" && item.visible !== false) {
                return React.createElement(ToolbarSeparator_1.default, { key: index });
            }
            if (item.visible === false || !item.icon) {
                return null;
            }
            const Icon = item.icon;
            const isActive = item.active ? item.active(state) : false;
            return (React.createElement(ToolbarButton_1.default, { key: index, onClick: () => item.name && this.props.commands[item.name](item.attrs), active: isActive },
                React.createElement(Tooltip, { tooltip: item.tooltip, placement: "top" },
                    React.createElement(Icon, { color: this.props.theme.toolbarItem }))));
        })));
    }
}
exports.default = styled_components_1.withTheme(Menu);
//# sourceMappingURL=Menu.js.map