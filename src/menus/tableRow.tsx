import { EditorState } from "prosemirror-state";
import { TrashIcon, InsertAboveIcon, InsertBelowIcon } from "outline-icons";
import { MenuItem } from "../types";

export default function tableRowMenuItems(
  state: EditorState,
  index: number
): MenuItem[] {
  return [
    {
      name: "addRowAfter",
      tooltip: "Insert row before",
      icon: InsertAboveIcon,
      attrs: { index: index - 1 },
      active: () => false,
      visible: index !== 0,
    },
    {
      name: "addRowAfter",
      tooltip: "Insert row after",
      icon: InsertBelowIcon,
      attrs: { index },
      active: () => false,
    },
    {
      name: "separator",
    },
    {
      name: "deleteRow",
      tooltip: "Delete row",
      icon: TrashIcon,
      active: () => false,
    },
  ];
}
