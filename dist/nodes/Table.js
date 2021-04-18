"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = __importDefault(require("./Node"));
const prosemirror_view_1 = require("prosemirror-view");
const prosemirror_tables_1 = require("prosemirror-tables");
const prosemirror_utils_1 = require("prosemirror-utils");
const prosemirror_state_1 = require("prosemirror-state");
class Table extends Node_1.default {
    get name() {
        return "table";
    }
    get schema() {
        return {
            content: "tr+",
            tableRole: "table",
            isolating: true,
            group: "block",
            parseDOM: [{ tag: "table" }],
            toDOM() {
                return [
                    "div",
                    { class: "scrollable-wrapper" },
                    [
                        "div",
                        { class: "scrollable" },
                        ["table", { class: "rme-table" }, ["tbody", 0]],
                    ],
                ];
            },
        };
    }
    commands({ schema }) {
        return {
            createTable: ({ rowsCount, colsCount }) => (state, dispatch) => {
                const offset = state.tr.selection.anchor + 1;
                const nodes = prosemirror_utils_1.createTable(schema, rowsCount, colsCount);
                const tr = state.tr.replaceSelectionWith(nodes).scrollIntoView();
                const resolvedPos = tr.doc.resolve(offset);
                tr.setSelection(prosemirror_state_1.TextSelection.near(resolvedPos));
                dispatch(tr);
            },
            setColumnAttr: ({ index, alignment }) => (state, dispatch) => {
                const cells = prosemirror_utils_1.getCellsInColumn(index)(state.selection) || [];
                let transaction = state.tr;
                cells.forEach(({ pos }) => {
                    transaction = transaction.setNodeMarkup(pos, null, {
                        alignment,
                    });
                });
                dispatch(transaction);
            },
            addColumnBefore: () => prosemirror_tables_1.addColumnBefore,
            addColumnAfter: () => prosemirror_tables_1.addColumnAfter,
            deleteColumn: () => prosemirror_tables_1.deleteColumn,
            addRowAfter: ({ index }) => (state, dispatch) => {
                if (index === 0) {
                    const tr = prosemirror_utils_1.addRowAt(index + 2, true)(state.tr);
                    dispatch(prosemirror_utils_1.moveRow(index + 2, index + 1)(tr));
                }
                else {
                    dispatch(prosemirror_utils_1.addRowAt(index + 1, true)(state.tr));
                }
            },
            deleteRow: () => prosemirror_tables_1.deleteRow,
            deleteTable: () => prosemirror_tables_1.deleteTable,
            toggleHeaderColumn: () => prosemirror_tables_1.toggleHeaderColumn,
            toggleHeaderRow: () => prosemirror_tables_1.toggleHeaderRow,
            toggleHeaderCell: () => prosemirror_tables_1.toggleHeaderCell,
            setCellAttr: () => prosemirror_tables_1.setCellAttr,
            fixTables: () => prosemirror_tables_1.fixTables,
        };
    }
    keys() {
        return {
            Tab: prosemirror_tables_1.goToNextCell(1),
            "Shift-Tab": prosemirror_tables_1.goToNextCell(-1),
            Enter: (state, dispatch) => {
                if (!prosemirror_tables_1.isInTable(state))
                    return false;
                const cells = prosemirror_utils_1.getCellsInColumn(0)(state.selection) || [];
                dispatch(prosemirror_utils_1.addRowAt(cells.length, true)(state.tr));
                return true;
            },
        };
    }
    toMarkdown(state, node) {
        state.renderTable(node);
        state.closeBlock(node);
    }
    parseMarkdown() {
        return { block: "table" };
    }
    get plugins() {
        return [
            prosemirror_tables_1.tableEditing(),
            new prosemirror_state_1.Plugin({
                props: {
                    decorations: state => {
                        const { doc } = state;
                        const decorations = [];
                        let index = 0;
                        doc.descendants((node, pos) => {
                            if (node.type.name !== this.name)
                                return;
                            const elements = document.getElementsByClassName("rme-table");
                            const table = elements[index];
                            if (!table)
                                return;
                            const element = table.parentElement;
                            const shadowRight = !!(element && element.scrollWidth > element.clientWidth);
                            if (shadowRight) {
                                decorations.push(prosemirror_view_1.Decoration.widget(pos + 1, () => {
                                    const shadow = document.createElement("div");
                                    shadow.className = "scrollable-shadow right";
                                    return shadow;
                                }));
                            }
                            index++;
                        });
                        return prosemirror_view_1.DecorationSet.create(doc, decorations);
                    },
                },
            }),
        ];
    }
}
exports.default = Table;
//# sourceMappingURL=Table.js.map