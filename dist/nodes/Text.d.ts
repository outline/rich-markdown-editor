import Node from "./Node";
export default class Text extends Node {
    get name(): string;
    get schema(): {
        group: string;
    };
    toMarkdown(state: any, node: any): void;
}
//# sourceMappingURL=Text.d.ts.map