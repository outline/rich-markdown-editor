"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isMarkActive = type => (state) => {
    if (!type) {
        return false;
    }
    const { from, $from, to, empty } = state.selection;
    return empty
        ? type.isInSet(state.storedMarks || $from.marks())
        : state.doc.rangeHasMark(from, to, type);
};
exports.default = isMarkActive;
//# sourceMappingURL=isMarkActive.js.map