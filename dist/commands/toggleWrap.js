"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_commands_1 = require("prosemirror-commands");
const isNodeActive_1 = __importDefault(require("../queries/isNodeActive"));
function toggleWrap(type, attrs) {
    return (state, dispatch) => {
        const isActive = isNodeActive_1.default(type)(state);
        if (isActive) {
            return prosemirror_commands_1.lift(state, dispatch);
        }
        return prosemirror_commands_1.wrapIn(type, attrs)(state, dispatch);
    };
}
exports.default = toggleWrap;
//# sourceMappingURL=toggleWrap.js.map