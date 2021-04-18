export class MarkdownSerializer {
    constructor(nodes: any, marks: any);
    nodes: any;
    marks: any;
    serialize(content: any, options: any): string;
}
export class MarkdownSerializerState {
    constructor(nodes: any, marks: any, options: any);
    nodes: any;
    marks: any;
    delim: any;
    out: string;
    closed: boolean;
    inTightList: any;
    options: any;
    flushClose(size: any): void;
    wrapBlock(delim: any, firstDelim: any, node: any, f: any): void;
    atBlank(): boolean;
    ensureNewLine(): void;
    write(content: any): void;
    closeBlock(node: any): void;
    text(text: any, escape: any): void;
    render(node: any, parent: any, index: any): void;
    renderContent(parent: any): void;
    renderInline(parent: any): void;
    renderList(node: any, delim: any, firstDelim: any): void;
    inList: any;
    renderTable(node: any): void;
    inTable: any;
    esc(str: any, startOfLine: any): any;
    quote(str: any): string;
    repeat(str: any, n: any): string;
    markString(mark: any, open: any, parent: any, index: any): any;
    getEnclosingWhitespace(text: any): {
        leading: any;
        trailing: any;
    };
}
//# sourceMappingURL=serializer.d.ts.map