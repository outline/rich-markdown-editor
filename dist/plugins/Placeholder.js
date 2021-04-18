"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_state_1 = require("prosemirror-state");
const prosemirror_view_1 = require("prosemirror-view");
const Extension_1 = __importDefault(require("../lib/Extension"));
class Placeholder extends Extension_1.default {
    get name() {
        return "empty-placeholder";
    }
    get defaultOptions() {
        return {
            emptyNodeClass: "placeholder",
            placeholder: "",
        };
    }
    get plugins() {
        return [
            new prosemirror_state_1.Plugin({
                props: {
                    decorations: state => {
                        const { doc } = state;
                        const decorations = [];
                        const completelyEmpty = doc.textContent === "" &&
                            doc.childCount <= 1 &&
                            doc.content.size <= 2;
                        doc.descendants((node, pos) => {
                            if (!completelyEmpty) {
                                return;
                            }
                            if (pos !== 0 || node.type.name !== "paragraph") {
                                return;
                            }
                            const decoration = prosemirror_view_1.Decoration.node(pos, pos + node.nodeSize, {
                                class: this.options.emptyNodeClass,
                                "data-empty-text": this.options.placeholder,
                            });
                            decorations.push(decoration);
                        });
                        return prosemirror_view_1.DecorationSet.create(doc, decorations);
                    },
                },
            }),
        ];
    }
}
exports.default = Placeholder;
//# sourceMappingURL=Placeholder.js.map