import Node from "./Node";
import { addColumnAfter, addColumnBefore, deleteColumn, deleteRow, deleteTable, fixTables, setCellAttr, toggleHeaderCell, toggleHeaderColumn, toggleHeaderRow } from "prosemirror-tables";
import { Plugin } from "prosemirror-state";
export default class Table extends Node {
    get name(): string;
    get schema(): {
        content: string;
        tableRole: string;
        isolating: boolean;
        group: string;
        parseDOM: {
            tag: string;
        }[];
        toDOM(): (string | {
            class: string;
        } | (string | {
            class: string;
        } | (string | (string | number)[] | {
            class: string;
        })[])[])[];
    };
    commands({ schema }: {
        schema: any;
    }): {
        createTable: ({ rowsCount, colsCount }: {
            rowsCount: any;
            colsCount: any;
        }) => (state: any, dispatch: any) => void;
        setColumnAttr: ({ index, alignment }: {
            index: any;
            alignment: any;
        }) => (state: any, dispatch: any) => void;
        addColumnBefore: () => typeof addColumnBefore;
        addColumnAfter: () => typeof addColumnAfter;
        deleteColumn: () => typeof deleteColumn;
        addRowAfter: ({ index }: {
            index: any;
        }) => (state: any, dispatch: any) => void;
        deleteRow: () => typeof deleteRow;
        deleteTable: () => typeof deleteTable;
        toggleHeaderColumn: () => typeof toggleHeaderColumn;
        toggleHeaderRow: () => typeof toggleHeaderRow;
        toggleHeaderCell: () => typeof toggleHeaderCell;
        setCellAttr: () => typeof setCellAttr;
        fixTables: () => typeof fixTables;
    };
    keys(): {
        Tab: (state: import("prosemirror-state").EditorState<any>, dispatch?: ((tr: import("prosemirror-state").Transaction<any>) => void) | undefined) => boolean;
        "Shift-Tab": (state: import("prosemirror-state").EditorState<any>, dispatch?: ((tr: import("prosemirror-state").Transaction<any>) => void) | undefined) => boolean;
        Enter: (state: any, dispatch: any) => boolean;
    };
    toMarkdown(state: any, node: any): void;
    parseMarkdown(): {
        block: string;
    };
    get plugins(): Plugin<any, any>[];
}
//# sourceMappingURL=Table.d.ts.map