import { Schema } from "prosemirror-model";
import { MarkdownParser } from "prosemirror-markdown";
import { MarkdownSerializer } from "./markdown/serializer";
import Editor from "../";
import Extension from "./Extension";
export default class ExtensionManager {
    extensions: Extension[];
    embeds: any;
    constructor(extensions?: Extension[], editor?: Editor);
    get nodes(): {};
    serializer(): MarkdownSerializer;
    parser({ schema }: {
        schema: any;
    }): MarkdownParser<any>;
    get marks(): {};
    get plugins(): import("prosemirror-state").Plugin<any, any>[];
    keymaps({ schema }: {
        schema: Schema;
    }): import("prosemirror-state").Plugin<any, any>[];
    inputRules({ schema }: {
        schema: Schema;
    }): import("prosemirror-inputrules").InputRule<any>[];
    commands({ schema, view }: {
        schema: any;
        view: any;
    }): {};
}
//# sourceMappingURL=ExtensionManager.d.ts.map