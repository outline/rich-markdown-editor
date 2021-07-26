"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const outline_icons_1 = require("outline-icons");
const isNodeActive_1 = __importDefault(require("../queries/isNodeActive"));
function dividerMenuItems(state, dictionary) {
    const { schema } = state;
    return [
        {
            name: "hr",
            tooltip: dictionary.pageBreak,
            attrs: { markup: "***" },
            active: isNodeActive_1.default(schema.nodes.hr, { markup: "***" }),
            icon: outline_icons_1.PageBreakIcon,
        },
        {
            name: "hr",
            tooltip: dictionary.hr,
            attrs: { markup: "---" },
            active: isNodeActive_1.default(schema.nodes.hr, { markup: "---" }),
            icon: outline_icons_1.HorizontalRuleIcon,
        },
    ];
}
exports.default = dividerMenuItems;
//# sourceMappingURL=divider.js.map