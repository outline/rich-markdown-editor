"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_view_1 = require("prosemirror-view");
const prosemirror_state_1 = require("prosemirror-state");
const prosemirror_utils_1 = require("prosemirror-utils");
const Node_1 = __importDefault(require("./Node"));
class TableCell extends Node_1.default {
    get name() {
        return "td";
    }
    get schema() {
        return {
            content: "paragraph+",
            tableRole: "cell",
            isolating: true,
            parseDOM: [{ tag: "td" }],
            toDOM(node) {
                return [
                    "td",
                    node.attrs.alignment
                        ? { style: `text-align: ${node.attrs.alignment}` }
                        : {},
                    0,
                ];
            },
            attrs: {
                colspan: { default: 1 },
                rowspan: { default: 1 },
                alignment: { default: null },
            },
        };
    }
    toMarkdown(state, node) {
        state.renderContent(node);
    }
    parseMarkdown() {
        return {
            block: "td",
            getAttrs: tok => ({ alignment: tok.info }),
        };
    }
    get plugins() {
        return [
            new prosemirror_state_1.Plugin({
                props: {
                    decorations: state => {
                        const { doc, selection } = state;
                        const decorations = [];
                        const cells = prosemirror_utils_1.getCellsInColumn(0)(selection);
                        if (cells) {
                            cells.forEach(({ pos }, index) => {
                                if (index === 0) {
                                    decorations.push(prosemirror_view_1.Decoration.widget(pos + 1, () => {
                                        let className = "grip-table";
                                        const selected = prosemirror_utils_1.isTableSelected(selection);
                                        if (selected) {
                                            className += " selected";
                                        }
                                        const grip = document.createElement("a");
                                        grip.className = className;
                                        grip.addEventListener("mousedown", event => {
                                            event.preventDefault();
                                            this.options.onSelectTable(state);
                                        });
                                        return grip;
                                    }));
                                }
                                decorations.push(prosemirror_view_1.Decoration.widget(pos + 1, () => {
                                    const rowSelected = prosemirror_utils_1.isRowSelected(index)(selection);
                                    let className = "grip-row";
                                    if (rowSelected) {
                                        className += " selected";
                                    }
                                    if (index === 0) {
                                        className += " first";
                                    }
                                    else if (index === cells.length - 1) {
                                        className += " last";
                                    }
                                    const grip = document.createElement("a");
                                    grip.className = className;
                                    grip.addEventListener("mousedown", event => {
                                        event.preventDefault();
                                        this.options.onSelectRow(index, state);
                                    });
                                    return grip;
                                }));
                            });
                        }
                        return prosemirror_view_1.DecorationSet.create(doc, decorations);
                    },
                },
            }),
        ];
    }
}
exports.default = TableCell;
//# sourceMappingURL=TableCell.js.map