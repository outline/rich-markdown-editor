"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function backspaceToParagraph(type) {
    return (state, dispatch) => {
        const { $from, from, to, empty } = state.selection;
        if (!empty)
            return null;
        if ($from.parent.type !== type)
            return null;
        const $pos = state.doc.resolve(from - 1);
        if ($pos.parent === $from.parent)
            return null;
        dispatch(state.tr
            .setBlockType(from, to, type.schema.nodes.paragraph)
            .scrollIntoView());
        return true;
    };
}
exports.default = backspaceToParagraph;
//# sourceMappingURL=backspaceToParagraph.js.map