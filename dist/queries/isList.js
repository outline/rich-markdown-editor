"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isList(node, schema) {
    return (node.type === schema.nodes.bullet_list ||
        node.type === schema.nodes.ordered_list ||
        node.type === schema.nodes.todo_list);
}
exports.default = isList;
//# sourceMappingURL=isList.js.map