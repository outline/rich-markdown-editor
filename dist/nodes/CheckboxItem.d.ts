import Node from "./Node";
export default class CheckboxItem extends Node {
    get name(): string;
    get schema(): {
        attrs: {
            checked: {
                default: boolean;
            };
        };
        content: string;
        defining: boolean;
        draggable: boolean;
        parseDOM: {
            tag: string;
            getAttrs: (dom: HTMLLIElement) => {
                checked: boolean;
            };
        }[];
        toDOM: (node: any) => (string | (string | number)[] | {
            "data-type": string;
            class: string | undefined;
        } | (string | HTMLInputElement | {
            contentEditable: boolean;
        })[])[];
    };
    handleChange: (event: any) => void;
    keys({ type }: {
        type: any;
    }): {
        Enter: (state: import("prosemirror-state").EditorState<any>, dispatch?: ((tr: import("prosemirror-state").Transaction<any>) => void) | undefined) => boolean;
        Tab: (state: import("prosemirror-state").EditorState<any>, dispatch?: ((tr: import("prosemirror-state").Transaction<any>) => void) | undefined) => boolean;
        "Shift-Tab": (state: import("prosemirror-state").EditorState<any>, dispatch?: ((tr: import("prosemirror-state").Transaction<any>) => void) | undefined) => boolean;
        "Mod-]": (state: import("prosemirror-state").EditorState<any>, dispatch?: ((tr: import("prosemirror-state").Transaction<any>) => void) | undefined) => boolean;
        "Mod-[": (state: import("prosemirror-state").EditorState<any>, dispatch?: ((tr: import("prosemirror-state").Transaction<any>) => void) | undefined) => boolean;
    };
    toMarkdown(state: any, node: any): void;
    parseMarkdown(): {
        block: string;
        getAttrs: (tok: any) => {
            checked: boolean | undefined;
        };
    };
}
//# sourceMappingURL=CheckboxItem.d.ts.map