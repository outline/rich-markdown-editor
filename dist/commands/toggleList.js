"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prosemirror_schema_list_1 = require("prosemirror-schema-list");
const prosemirror_utils_1 = require("prosemirror-utils");
const isList_1 = __importDefault(require("../queries/isList"));
function toggleList(listType, itemType) {
    return (state, dispatch) => {
        const { schema, selection } = state;
        const { $from, $to } = selection;
        const range = $from.blockRange($to);
        if (!range) {
            return false;
        }
        const parentList = prosemirror_utils_1.findParentNode(node => isList_1.default(node, schema))(selection);
        if (range.depth >= 1 && parentList && range.depth - parentList.depth <= 1) {
            if (parentList.node.type === listType) {
                return prosemirror_schema_list_1.liftListItem(itemType)(state, dispatch);
            }
            if (isList_1.default(parentList.node, schema) &&
                listType.validContent(parentList.node.content)) {
                const { tr } = state;
                tr.setNodeMarkup(parentList.pos, listType);
                if (dispatch) {
                    dispatch(tr);
                }
                return false;
            }
        }
        return prosemirror_schema_list_1.wrapInList(listType)(state, dispatch);
    };
}
exports.default = toggleList;
//# sourceMappingURL=toggleList.js.map