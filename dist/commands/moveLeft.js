"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_state_1 = require("prosemirror-state");
const isMarkActive_1 = __importDefault(require("../queries/isMarkActive"));
function hasCode(state, pos) {
    const { code_inline } = state.schema.marks;
    const node = pos >= 0 && state.doc.nodeAt(pos);
    return node
        ? !!node.marks.filter(mark => mark.type === code_inline).length
        : false;
}
function moveLeft() {
    return (state, dispatch) => {
        const { code_inline } = state.schema.marks;
        const { empty, $cursor } = state.selection;
        if (!empty || !$cursor) {
            return false;
        }
        const { storedMarks } = state.tr;
        if (code_inline) {
            const insideCode = code_inline && isMarkActive_1.default(code_inline)(state);
            const currentPosHasCode = hasCode(state, $cursor.pos);
            const nextPosHasCode = hasCode(state, $cursor.pos - 1);
            const nextNextPosHasCode = hasCode(state, $cursor.pos - 2);
            const exitingCode = currentPosHasCode && !nextPosHasCode && Array.isArray(storedMarks);
            const atLeftEdge = nextPosHasCode &&
                !nextNextPosHasCode &&
                (storedMarks === null ||
                    (Array.isArray(storedMarks) && !!storedMarks.length));
            const atRightEdge = ((exitingCode && Array.isArray(storedMarks) && !storedMarks.length) ||
                (!exitingCode && storedMarks === null)) &&
                !nextPosHasCode &&
                nextNextPosHasCode;
            const enteringCode = !currentPosHasCode &&
                nextPosHasCode &&
                Array.isArray(storedMarks) &&
                !storedMarks.length;
            if (!insideCode && atRightEdge) {
                const tr = state.tr.setSelection(prosemirror_state_1.Selection.near(state.doc.resolve($cursor.pos - 1)));
                dispatch(tr.removeStoredMark(code_inline));
                return true;
            }
            if (!insideCode && enteringCode) {
                dispatch(state.tr.addStoredMark(code_inline.create()));
                return true;
            }
            if (insideCode && atLeftEdge) {
                const tr = state.tr.setSelection(prosemirror_state_1.Selection.near(state.doc.resolve($cursor.pos - 1)));
                dispatch(tr.addStoredMark(code_inline.create()));
                return true;
            }
            const isFirstChild = $cursor.index($cursor.depth - 1) === 0;
            if (insideCode &&
                (exitingCode || (!$cursor.nodeBefore && isFirstChild))) {
                dispatch(state.tr.removeStoredMark(code_inline));
                return true;
            }
        }
        return false;
    };
}
exports.default = moveLeft;
//# sourceMappingURL=moveLeft.js.map