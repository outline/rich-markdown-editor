import { InputRule } from "prosemirror-inputrules";
import Node from "./Node";
export default class HorizontalRule extends Node {
    get name(): string;
    get schema(): {
        attrs: {
            markup: {
                default: string;
            };
        };
        group: string;
        parseDOM: {
            tag: string;
        }[];
        toDOM: (node: any) => (string | {
            class: string;
        })[];
    };
    commands({ type }: {
        type: any;
    }): (attrs: any) => (state: any, dispatch: any) => boolean;
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
        getAttrs: (tok: any) => {
            markup: any;
        };
    };
}
//# sourceMappingURL=HorizontalRule.d.ts.map