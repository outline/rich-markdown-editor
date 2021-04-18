"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const outline_icons_1 = require("outline-icons");
function tableMenuItems(dictionary) {
    return [
        {
            name: "deleteTable",
            tooltip: dictionary.deleteTable,
            icon: outline_icons_1.TrashIcon,
            active: () => false,
        },
    ];
}
exports.default = tableMenuItems;
//# sourceMappingURL=table.js.map