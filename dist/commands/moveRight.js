"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const isMarkActive_1 = __importDefault(require("../queries/isMarkActive"));
function moveRight() {
    return (state, dispatch) => {
        const { code_inline } = state.schema.marks;
        const { empty, $cursor } = state.selection;
        if (!empty || !$cursor) {
            return false;
        }
        const { storedMarks } = state.tr;
        if (code_inline) {
            const insideCode = isMarkActive_1.default(code_inline)(state);
            const currentPosHasCode = state.doc.rangeHasMark($cursor.pos, $cursor.pos, code_inline);
            const nextPosHasCode = state.doc.rangeHasMark($cursor.pos, $cursor.pos + 1, code_inline);
            const exitingCode = !currentPosHasCode &&
                !nextPosHasCode &&
                (!storedMarks || !!storedMarks.length);
            const enteringCode = !currentPosHasCode &&
                nextPosHasCode &&
                (!storedMarks || !storedMarks.length);
            if (!insideCode && enteringCode) {
                dispatch(state.tr.addStoredMark(code_inline.create()));
                return true;
            }
            if (insideCode && exitingCode) {
                dispatch(state.tr.removeStoredMark(code_inline));
                return true;
            }
        }
        return false;
    };
}
exports.default = moveRight;
//# sourceMappingURL=moveRight.js.map