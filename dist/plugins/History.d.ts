import { undoInputRule } from "prosemirror-inputrules";
import { undo, redo } from "prosemirror-history";
import Extension from "../lib/Extension";
export default class History extends Extension {
    get name(): string;
    keys(): {
        "Mod-z": typeof undo;
        "Mod-y": typeof redo;
        "Shift-Mod-z": typeof redo;
        Backspace: typeof undoInputRule;
    };
    get plugins(): import("prosemirror-state").Plugin<any, any>[];
}
//# sourceMappingURL=History.d.ts.map