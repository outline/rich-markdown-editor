"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Extension_1 = __importDefault(require("../lib/Extension"));
class Node extends Extension_1.default {
    get type() {
        return "node";
    }
    get markdownToken() {
        return "";
    }
    toMarkdown(state, node) {
        console.error("toMarkdown not implemented", state, node);
    }
    parseMarkdown() {
        return;
    }
}
exports.default = Node;
//# sourceMappingURL=Node.js.map