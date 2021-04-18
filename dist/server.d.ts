import { Schema } from "prosemirror-model";
import render from "./lib/renderToHtml";
export declare const schema: Schema<never, never>;
export declare const parser: import("prosemirror-markdown").MarkdownParser<any>;
export declare const serializer: import("./lib/markdown/serializer").MarkdownSerializer;
export declare const renderToHtml: typeof render;
//# sourceMappingURL=server.d.ts.map