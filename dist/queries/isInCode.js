"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const isMarkActive_1 = __importDefault(require("./isMarkActive"));
function isInCode(state) {
    const $head = state.selection.$head;
    for (let d = $head.depth; d > 0; d--) {
        if ($head.node(d).type === state.schema.nodes.code_block) {
            return true;
        }
    }
    return isMarkActive_1.default(state.schema.marks.code_inline)(state);
}
exports.default = isInCode;
//# sourceMappingURL=isInCode.js.map