"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getRowIndex(selection) {
    const isRowSelection = selection.isRowSelection && selection.isRowSelection();
    if (!isRowSelection)
        return undefined;
    const path = selection.$from.path;
    return path[path.length - 8];
}
exports.default = getRowIndex;
//# sourceMappingURL=getRowIndex.js.map