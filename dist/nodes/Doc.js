"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = __importDefault(require("./Node"));
class Doc extends Node_1.default {
    get name() {
        return "doc";
    }
    get schema() {
        return {
            content: "block+",
        };
    }
}
exports.default = Doc;
//# sourceMappingURL=Doc.js.map