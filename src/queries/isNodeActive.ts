const isNodeActive = (type, attrs?: Record<string, any>) => state => {
  const { $from, to, node } = state.selection;

  if (node) {
    return attrs ? node.hasMarkup(type, attrs) : node.type === type;
  }

  return (
    to <= $from.end() &&
    (attrs ? $from.parent.hasMarkup(type, attrs) : $from.parent.type === type)
  );
};

export default isNodeActive;
