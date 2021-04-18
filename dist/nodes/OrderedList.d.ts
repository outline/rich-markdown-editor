import Node from "./Node";
export default class OrderedList extends Node {
    get name(): string;
    get schema(): {
        attrs: {
            order: {
                default: number;
            };
        };
        content: string;
        group: string;
        parseDOM: {
            tag: string;
            getAttrs: (dom: HTMLOListElement) => {
                order: number;
            };
        }[];
        toDOM: (node: any) => (string | number | {
            start: any;
        })[];
    };
    commands({ type, schema }: {
        type: any;
        schema: any;
    }): () => (state: import("prosemirror-state").EditorState<any>, dispatch: (tr: import("prosemirror-state").Transaction<any>) => void) => boolean;
    keys({ type, schema }: {
        type: any;
        schema: any;
    }): {
        "Shift-Ctrl-9": (state: import("prosemirror-state").EditorState<any>, dispatch: (tr: import("prosemirror-state").Transaction<any>) => void) => boolean;
    };
    inputRules({ type }: {
        type: any;
    }): import("prosemirror-inputrules").InputRule<any>[];
    toMarkdown(state: any, node: any): void;
    parseMarkdown(): {
        block: string;
    };
}
//# sourceMappingURL=OrderedList.d.ts.map