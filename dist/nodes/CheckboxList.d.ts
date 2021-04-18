import Node from "./Node";
export default class CheckboxList extends Node {
    get name(): string;
    get schema(): {
        group: string;
        content: string;
        toDOM: () => (string | number | {
            class: string;
        })[];
        parseDOM: {
            tag: string;
        }[];
    };
    keys({ type, schema }: {
        type: any;
        schema: any;
    }): {
        "Shift-Ctrl-7": (state: import("prosemirror-state").EditorState<any>, dispatch: (tr: import("prosemirror-state").Transaction<any>) => void) => boolean;
    };
    commands({ type, schema }: {
        type: any;
        schema: any;
    }): () => (state: import("prosemirror-state").EditorState<any>, dispatch: (tr: import("prosemirror-state").Transaction<any>) => void) => boolean;
    inputRules({ type }: {
        type: any;
    }): import("prosemirror-inputrules").InputRule<any>[];
    toMarkdown(state: any, node: any): void;
    parseMarkdown(): {
        block: string;
    };
}
//# sourceMappingURL=CheckboxList.d.ts.map