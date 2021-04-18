import Node from "./Node";
export default class TableRow extends Node {
    get name(): string;
    get schema(): {
        content: string;
        tableRole: string;
        parseDOM: {
            tag: string;
        }[];
        toDOM(): (string | number)[];
    };
    parseMarkdown(): {
        block: string;
    };
}
//# sourceMappingURL=TableRow.d.ts.map