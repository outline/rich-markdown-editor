import { Plugin } from "prosemirror-state";
import Extension from "../lib/Extension";
export default class Placeholder extends Extension {
    get name(): string;
    get defaultOptions(): {
        emptyNodeClass: string;
        placeholder: string;
    };
    get plugins(): Plugin<any, any>[];
}
//# sourceMappingURL=Placeholder.d.ts.map