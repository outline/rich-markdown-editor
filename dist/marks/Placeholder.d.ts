import { Plugin } from "prosemirror-state";
import Mark from "./Mark";
export default class Placeholder extends Mark {
    get name(): string;
    get schema(): {
        parseDOM: {
            tag: string;
        }[];
        toDOM: () => (string | {
            class: string;
        })[];
    };
    get toMarkdown(): {
        open: string;
        close: string;
        mixable: boolean;
        expelEnclosingWhitespace: boolean;
    };
    parseMarkdown(): {
        mark: string;
    };
    get plugins(): Plugin<any, any>[];
}
//# sourceMappingURL=Placeholder.d.ts.map