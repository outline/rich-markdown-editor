import { InputRule } from "prosemirror-inputrules";
import Node from "./Node";
export default class HorizontalRule extends Node {
    get name(): string;
    get schema(): {
        group: string;
        parseDOM: {
            tag: string;
        }[];
        toDOM(): string[];
    };
    commands({ type }: {
        type: any;
    }): () => (state: any, dispatch: any) => boolean;
    keys({ type }: {
        type: any;
    }): {
        "Mod-_": (state: any, dispatch: any) => boolean;
    };
    inputRules({ type }: {
        type: any;
    }): InputRule<any>[];
    toMarkdown(state: any, node: any): void;
    parseMarkdown(): {
        node: string;
    };
}
//# sourceMappingURL=HorizontalRule.d.ts.map