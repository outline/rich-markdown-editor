"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isInList(state) {
    const $head = state.selection.$head;
    for (let d = $head.depth; d > 0; d--) {
        if (["ordered_list", "bullet_list", "checkbox_list"].includes($head.node(d).type.name)) {
            return true;
        }
    }
    return false;
}
exports.default = isInList;
//# sourceMappingURL=isInList.js.map