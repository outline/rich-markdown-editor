"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getColumnIndex(selection) {
    const isColSelection = selection.isColSelection && selection.isColSelection();
    if (!isColSelection)
        return undefined;
    const path = selection.$from.path;
    return path[path.length - 5];
}
exports.default = getColumnIndex;
//# sourceMappingURL=getColumnIndex.js.map