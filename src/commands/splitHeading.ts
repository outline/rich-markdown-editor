import { TextSelection } from "prosemirror-state";
import { findBlockNodes } from "prosemirror-utils";
import findCollapsedNodes from "../queries/findCollapsedNodes";

export default function splitHeading(type) {
  return (state, dispatch) => {
    const { $from, from, $to, to } = state.selection;

    // check we're in a matching node
    if ($from.parent.type !== type) return false;

    const endPos = $to.after() - 1;
    if (endPos !== to) return false;

    if (!$from.parent.attrs.collapsed) return false;

    const allBlocks = findBlockNodes(state.doc);
    const collapsedBlocks = findCollapsedNodes(state.doc);
    const visibleBlocks = allBlocks.filter(
      a => !collapsedBlocks.find(b => b.pos === a.pos)
    );
    const nextVisibleBlock = visibleBlocks.find(a => a.pos > from);
    const pos = nextVisibleBlock
      ? nextVisibleBlock.pos
      : state.doc.content.size;

    const transaction = state.tr.insert(
      pos,
      type.create({ ...$from.parent.attrs, collapsed: false })
    );

    dispatch(
      transaction
        .setSelection(
          TextSelection.near(
            transaction.doc.resolve(
              Math.min(pos + 1, transaction.doc.content.size)
            )
          )
        )
        .scrollIntoView()
    );

    return true;
  };
}
