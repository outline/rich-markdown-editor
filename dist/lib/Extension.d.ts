import { InputRule } from "prosemirror-inputrules";
import { Plugin } from "prosemirror-state";
import Editor from "../";
declare type Command = (attrs: any) => (state: any, dispatch: any) => any;
export default class Extension {
    options: Record<string, any>;
    editor: Editor;
    constructor(options?: Record<string, any>);
    bindEditor(editor: Editor): void;
    get type(): string;
    get name(): string;
    get plugins(): Plugin[];
    keys(options: any): {};
    inputRules(options: any): InputRule[];
    commands(options: any): Record<string, Command> | Command;
    get defaultOptions(): {};
}
export {};
//# sourceMappingURL=Extension.d.ts.map