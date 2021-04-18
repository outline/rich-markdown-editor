import { InputRule } from "prosemirror-inputrules";
import { Plugin } from "prosemirror-state";
import Extension from "../lib/Extension";
export default class BlockMenuTrigger extends Extension {
    get name(): string;
    get plugins(): Plugin<any, any>[];
    inputRules(): InputRule<any>[];
}
//# sourceMappingURL=BlockMenuTrigger.d.ts.map