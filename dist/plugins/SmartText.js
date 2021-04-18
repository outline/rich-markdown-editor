"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_inputrules_1 = require("prosemirror-inputrules");
const Extension_1 = __importDefault(require("../lib/Extension"));
const rightArrow = new prosemirror_inputrules_1.InputRule(/->$/, "→");
class SmartText extends Extension_1.default {
    get name() {
        return "smart_text";
    }
    inputRules() {
        return [rightArrow, prosemirror_inputrules_1.ellipsis, ...prosemirror_inputrules_1.smartQuotes];
    }
}
exports.default = SmartText;
//# sourceMappingURL=SmartText.js.map