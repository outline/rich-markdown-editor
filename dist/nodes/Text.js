"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = __importDefault(require("./Node"));
class Text extends Node_1.default {
    get name() {
        return "text";
    }
    get schema() {
        return {
            group: "inline",
        };
    }
    toMarkdown(state, node) {
        state.text(node.text);
    }
}
exports.default = Text;
//# sourceMappingURL=Text.js.map