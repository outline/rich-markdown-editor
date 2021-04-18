import { MarkdownSerializerState } from "prosemirror-markdown";
import { Node as ProsemirrorNode } from "prosemirror-model";
import Extension from "../lib/Extension";
export default abstract class Node extends Extension {
    get type(): string;
    abstract get schema(): any;
    get markdownToken(): string;
    toMarkdown(state: MarkdownSerializerState, node: ProsemirrorNode): void;
    parseMarkdown(): void;
}
//# sourceMappingURL=Node.d.ts.map