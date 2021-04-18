import Node from "./Node";
export default class CodeFence extends Node {
    get languageOptions(): [string, string][];
    get name(): string;
    get schema(): {
        attrs: {
            language: {
                default: string;
            };
        };
        content: string;
        marks: string;
        group: string;
        code: boolean;
        defining: boolean;
        draggable: boolean;
        parseDOM: ({
            tag: string;
            preserveWhitespace: string;
            contentElement?: undefined;
            getAttrs?: undefined;
        } | {
            tag: string;
            preserveWhitespace: string;
            contentElement: string;
            getAttrs: (dom: HTMLDivElement) => {
                language: string | undefined;
            };
        })[];
        toDOM: (node: any) => (string | {
            class: string;
            "data-language": any;
        } | (string | HTMLButtonElement | HTMLSelectElement | {
            contentEditable: boolean;
        })[] | (string | (string | number | {
            spellCheck: boolean;
        })[])[])[];
    };
    commands({ type }: {
        type: any;
    }): () => (state: import("prosemirror-state").EditorState<any>, dispatch?: ((tr: import("prosemirror-state").Transaction<any>) => void) | undefined) => boolean;
    keys({ type }: {
        type: any;
    }): {
        "Shift-Ctrl-\\": (state: import("prosemirror-state").EditorState<any>, dispatch?: ((tr: import("prosemirror-state").Transaction<any>) => void) | undefined) => boolean;
        "Shift-Enter": (state: any, dispatch: any) => boolean;
        Tab: (state: any, dispatch: any) => boolean;
    };
    handleCopyToClipboard: (event: any) => void;
    handleLanguageChange: (event: any) => void;
    get plugins(): import("prosemirror-state").Plugin<any, any>[];
    inputRules({ type }: {
        type: any;
    }): import("prosemirror-inputrules").InputRule<any>[];
    toMarkdown(state: any, node: any): void;
    get markdownToken(): string;
    parseMarkdown(): {
        block: string;
        getAttrs: (tok: any) => {
            language: any;
        };
    };
}
//# sourceMappingURL=CodeFence.d.ts.map