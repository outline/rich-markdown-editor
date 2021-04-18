import Node from "./Node";
export default class HardBreak extends Node {
    get name(): string;
    get schema(): {
        inline: boolean;
        group: string;
        selectable: boolean;
        parseDOM: {
            tag: string;
        }[];
        toDOM(): string[];
    };
    commands({ type }: {
        type: any;
    }): () => (state: any, dispatch: any) => boolean;
    keys({ type }: {
        type: any;
    }): {
        "Shift-Enter": (state: any, dispatch: any) => boolean;
    };
    toMarkdown(state: any): void;
    parseMarkdown(): {
        node: string;
    };
}
//# sourceMappingURL=HardBreak.d.ts.map