"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_commands_1 = require("prosemirror-commands");
const isNodeActive_1 = __importDefault(require("../queries/isNodeActive"));
function toggleBlockType(type, toggleType, attrs = {}) {
    return (state, dispatch) => {
        const isActive = isNodeActive_1.default(type, attrs)(state);
        if (isActive) {
            return prosemirror_commands_1.setBlockType(toggleType)(state, dispatch);
        }
        return prosemirror_commands_1.setBlockType(type, attrs)(state, dispatch);
    };
}
exports.default = toggleBlockType;
//# sourceMappingURL=toggleBlockType.js.map