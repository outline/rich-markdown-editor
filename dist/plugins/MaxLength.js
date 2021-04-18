"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_state_1 = require("prosemirror-state");
const Extension_1 = __importDefault(require("../lib/Extension"));
class MaxLength extends Extension_1.default {
    get name() {
        return "maxlength";
    }
    get plugins() {
        return [
            new prosemirror_state_1.Plugin({
                filterTransaction: (tr) => {
                    if (this.options.maxLength) {
                        const result = tr.doc && tr.doc.nodeSize > this.options.maxLength;
                        return !result;
                    }
                    return true;
                },
            }),
        ];
    }
}
exports.default = MaxLength;
//# sourceMappingURL=MaxLength.js.map