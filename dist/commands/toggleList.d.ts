import { NodeType } from "prosemirror-model";
import { EditorState, Transaction } from "prosemirror-state";
export default function toggleList(listType: NodeType, itemType: NodeType): (state: EditorState, dispatch: (tr: Transaction) => void) => boolean;
//# sourceMappingURL=toggleList.d.ts.map