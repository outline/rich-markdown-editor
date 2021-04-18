import Extension from "../lib/Extension";
export default abstract class Mark extends Extension {
    get type(): string;
    abstract get schema(): any;
    get markdownToken(): string;
    get toMarkdown(): Record<string, any>;
    parseMarkdown(): {};
    commands({ type }: {
        type: any;
    }): () => (state: import("prosemirror-state").EditorState<any>, dispatch?: ((tr: import("prosemirror-state").Transaction<any>) => void) | undefined) => boolean;
}
//# sourceMappingURL=Mark.d.ts.map