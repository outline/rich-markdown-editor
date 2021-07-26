import Node from "./Node";
export default class Blockquote extends Node {
    get name(): string;
    get schema(): {
        content: string;
        group: string;
        defining: boolean;
        parseDOM: {
            tag: string;
        }[];
        toDOM: () => (string | number)[];
    };
    inputRules({ type }: {
        type: any;
    }): import("prosemirror-inputrules").InputRule<any>[];
    commands({ type }: {
        type: any;
    }): () => (state: any, dispatch: any) => boolean;
    keys({ type }: {
        type: any;
    }): {
        "Ctrl->": (state: any, dispatch: any) => boolean;
        "Mod-]": (state: any, dispatch: any) => boolean;
        "Shift-Enter": (state: any, dispatch: any) => boolean;
    };
    toMarkdown(state: any, node: any): void;
    parseMarkdown(): {
        block: string;
    };
}
//# sourceMappingURL=Blockquote.d.ts.map