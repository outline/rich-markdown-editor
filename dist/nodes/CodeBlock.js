"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CodeFence_1 = __importDefault(require("./CodeFence"));
class CodeBlock extends CodeFence_1.default {
    get name() {
        return "code_block";
    }
    get markdownToken() {
        return "code_block";
    }
}
exports.default = CodeBlock;
//# sourceMappingURL=CodeBlock.js.map