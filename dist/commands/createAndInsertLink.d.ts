import { EditorView } from "prosemirror-view";
import baseDictionary from "../dictionary";
declare const createAndInsertLink: (view: EditorView, title: string, href: string, options: {
    dictionary: typeof baseDictionary;
    onCreateLink: (title: string) => Promise<string>;
    onShowToast?: ((message: string, code: string) => void) | undefined;
}) => Promise<void>;
export default createAndInsertLink;
//# sourceMappingURL=createAndInsertLink.d.ts.map