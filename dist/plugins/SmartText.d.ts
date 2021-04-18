import { InputRule } from "prosemirror-inputrules";
import Extension from "../lib/Extension";
export default class SmartText extends Extension {
    get name(): string;
    inputRules(): InputRule<any>[];
}
//# sourceMappingURL=SmartText.d.ts.map