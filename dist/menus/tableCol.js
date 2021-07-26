"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const outline_icons_1 = require("outline-icons");
const isNodeActive_1 = __importDefault(require("../queries/isNodeActive"));
function tableColMenuItems(state, index, rtl, dictionary) {
    const { schema } = state;
    return [
        {
            name: "setColumnAttr",
            tooltip: dictionary.alignLeft,
            icon: outline_icons_1.AlignLeftIcon,
            attrs: { index, alignment: "left" },
            active: isNodeActive_1.default(schema.nodes.th, {
                colspan: 1,
                rowspan: 1,
                alignment: "left",
            }),
        },
        {
            name: "setColumnAttr",
            tooltip: dictionary.alignCenter,
            icon: outline_icons_1.AlignCenterIcon,
            attrs: { index, alignment: "center" },
            active: isNodeActive_1.default(schema.nodes.th, {
                colspan: 1,
                rowspan: 1,
                alignment: "center",
            }),
        },
        {
            name: "setColumnAttr",
            tooltip: dictionary.alignRight,
            icon: outline_icons_1.AlignRightIcon,
            attrs: { index, alignment: "right" },
            active: isNodeActive_1.default(schema.nodes.th, {
                colspan: 1,
                rowspan: 1,
                alignment: "right",
            }),
        },
        {
            name: "separator",
        },
        {
            name: rtl ? "addColumnAfter" : "addColumnBefore",
            tooltip: rtl ? dictionary.addColumnAfter : dictionary.addColumnBefore,
            icon: outline_icons_1.InsertLeftIcon,
            active: () => false,
        },
        {
            name: rtl ? "addColumnBefore" : "addColumnAfter",
            tooltip: rtl ? dictionary.addColumnBefore : dictionary.addColumnAfter,
            icon: outline_icons_1.InsertRightIcon,
            active: () => false,
        },
        {
            name: "separator",
        },
        {
            name: "deleteColumn",
            tooltip: dictionary.deleteColumn,
            icon: outline_icons_1.TrashIcon,
            active: () => false,
        },
    ];
}
exports.default = tableColMenuItems;
//# sourceMappingURL=tableCol.js.map