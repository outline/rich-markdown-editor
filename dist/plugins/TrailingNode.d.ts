import { Plugin } from "prosemirror-state";
import Extension from "../lib/Extension";
export default class TrailingNode extends Extension {
    get name(): string;
    get defaultOptions(): {
        node: string;
        notAfter: string[];
    };
    get plugins(): Plugin<any, any>[];
}
//# sourceMappingURL=TrailingNode.d.ts.map