import Mark from "./Mark";
export default class Code extends Mark {
    get name(): string;
    get schema(): {
        excludes: string;
        parseDOM: {
            tag: string;
        }[];
        toDOM: () => (string | {
            spellCheck: boolean;
        })[];
    };
    inputRules({ type }: {
        type: any;
    }): import("prosemirror-inputrules").InputRule<any>[];
    keys({ type }: {
        type: any;
    }): {
        "Mod`": (state: import("prosemirror-state").EditorState<any>, dispatch?: ((tr: import("prosemirror-state").Transaction<any>) => void) | undefined) => boolean;
    };
    get toMarkdown(): {
        open(_state: any, _mark: any, parent: any, index: any): string;
        close(_state: any, _mark: any, parent: any, index: any): string;
        escape: boolean;
    };
    parseMarkdown(): {
        mark: string;
    };
}
//# sourceMappingURL=Code.d.ts.map