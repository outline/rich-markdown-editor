"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const headingToSlug_1 = __importDefault(require("./headingToSlug"));
function getHeadings(view) {
    const headings = [];
    const previouslySeen = {};
    view.state.doc.forEach(node => {
        if (node.type.name === "heading") {
            const id = headingToSlug_1.default(node);
            let name = id;
            if (previouslySeen[id] > 0) {
                name = headingToSlug_1.default(node, previouslySeen[id]);
            }
            previouslySeen[id] =
                previouslySeen[id] !== undefined ? previouslySeen[id] + 1 : 1;
            headings.push({
                title: node.textContent,
                level: node.attrs.level,
                id: name,
            });
        }
    });
    return headings;
}
exports.default = getHeadings;
//# sourceMappingURL=getHeadings.js.map