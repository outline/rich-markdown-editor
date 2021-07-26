import { Plugin } from "prosemirror-state";
import Extension from "../lib/Extension";
export default class Folding extends Extension {
    get name(): string;
    get plugins(): Plugin<any, any>[];
}
//# sourceMappingURL=Folding.d.ts.map