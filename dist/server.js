"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderToHtml = exports.serializer = exports.parser = exports.schema = void 0;
const prosemirror_model_1 = require("prosemirror-model");
const ExtensionManager_1 = __importDefault(require("./lib/ExtensionManager"));
const renderToHtml_1 = __importDefault(require("./lib/renderToHtml"));
const Doc_1 = __importDefault(require("./nodes/Doc"));
const Text_1 = __importDefault(require("./nodes/Text"));
const Blockquote_1 = __importDefault(require("./nodes/Blockquote"));
const BulletList_1 = __importDefault(require("./nodes/BulletList"));
const CodeBlock_1 = __importDefault(require("./nodes/CodeBlock"));
const CodeFence_1 = __importDefault(require("./nodes/CodeFence"));
const CheckboxList_1 = __importDefault(require("./nodes/CheckboxList"));
const CheckboxItem_1 = __importDefault(require("./nodes/CheckboxItem"));
const Embed_1 = __importDefault(require("./nodes/Embed"));
const HardBreak_1 = __importDefault(require("./nodes/HardBreak"));
const Heading_1 = __importDefault(require("./nodes/Heading"));
const HorizontalRule_1 = __importDefault(require("./nodes/HorizontalRule"));
const Image_1 = __importDefault(require("./nodes/Image"));
const ListItem_1 = __importDefault(require("./nodes/ListItem"));
const Notice_1 = __importDefault(require("./nodes/Notice"));
const OrderedList_1 = __importDefault(require("./nodes/OrderedList"));
const Paragraph_1 = __importDefault(require("./nodes/Paragraph"));
const Table_1 = __importDefault(require("./nodes/Table"));
const TableCell_1 = __importDefault(require("./nodes/TableCell"));
const TableHeadCell_1 = __importDefault(require("./nodes/TableHeadCell"));
const TableRow_1 = __importDefault(require("./nodes/TableRow"));
const Bold_1 = __importDefault(require("./marks/Bold"));
const Code_1 = __importDefault(require("./marks/Code"));
const Highlight_1 = __importDefault(require("./marks/Highlight"));
const Italic_1 = __importDefault(require("./marks/Italic"));
const Link_1 = __importDefault(require("./marks/Link"));
const Strikethrough_1 = __importDefault(require("./marks/Strikethrough"));
const Placeholder_1 = __importDefault(require("./marks/Placeholder"));
const Underline_1 = __importDefault(require("./marks/Underline"));
const extensions = new ExtensionManager_1.default([
    new Doc_1.default(),
    new Text_1.default(),
    new HardBreak_1.default(),
    new Paragraph_1.default(),
    new Blockquote_1.default(),
    new BulletList_1.default(),
    new CodeBlock_1.default(),
    new CodeFence_1.default(),
    new CheckboxList_1.default(),
    new CheckboxItem_1.default(),
    new Embed_1.default(),
    new ListItem_1.default(),
    new Notice_1.default(),
    new Heading_1.default(),
    new HorizontalRule_1.default(),
    new Image_1.default(),
    new Table_1.default(),
    new TableCell_1.default(),
    new TableHeadCell_1.default(),
    new TableRow_1.default(),
    new Bold_1.default(),
    new Code_1.default(),
    new Highlight_1.default(),
    new Italic_1.default(),
    new Link_1.default(),
    new Strikethrough_1.default(),
    new Placeholder_1.default(),
    new Underline_1.default(),
    new OrderedList_1.default(),
]);
exports.schema = new prosemirror_model_1.Schema({
    nodes: extensions.nodes,
    marks: extensions.marks,
});
exports.parser = extensions.parser({
    schema: exports.schema,
});
exports.serializer = extensions.serializer();
exports.renderToHtml = renderToHtml_1.default;
//# sourceMappingURL=server.js.map