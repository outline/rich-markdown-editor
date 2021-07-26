"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.headingToPersistenceKey = void 0;
const escape_1 = __importDefault(require("lodash/escape"));
const slugify_1 = __importDefault(require("slugify"));
function safeSlugify(text) {
    return `h-${escape_1.default(slugify_1.default(text, {
        remove: /[!"#$%&'\.()*+,\/:;<=>?@\[\]\\^_`{|}~]/g,
        lower: true,
    }))}`;
}
function headingToSlug(node, index = 0) {
    const slugified = safeSlugify(node.textContent);
    if (index === 0)
        return slugified;
    return `${slugified}-${index}`;
}
exports.default = headingToSlug;
function headingToPersistenceKey(node, id) {
    const slug = headingToSlug(node);
    return `rme-${id || (window === null || window === void 0 ? void 0 : window.location.pathname)}–${slug}`;
}
exports.headingToPersistenceKey = headingToPersistenceKey;
//# sourceMappingURL=headingToSlug.js.map