export default function getRowIndex(selection) {
  const isRowSelection = selection.isRowSelection && selection.isRowSelection();
  if (!isRowSelection) return undefined;

  const path = selection.$from.path;
  return path[path.length - 8];
}
