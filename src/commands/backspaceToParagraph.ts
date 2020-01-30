export default function backspaceToParagraph(type) {
  return (state, dispatch) => {
    const { $from, from, to } = state.selection;

    // check we're in a matching node
    if ($from.parent.type !== type) return null;

    // check if we're at the beginning of the heading
    const $pos = state.doc.resolve(from - 1);
    if ($pos.parent === $from.parent) return null;

    // okay, replace it with a paragraph
    dispatch(
      state.tr
        .setBlockType(from, to, type.schema.nodes.paragraph)
        .scrollIntoView()
    );
    return true;
  };
}
