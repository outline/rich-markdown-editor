import { TrashIcon } from "outline-icons";
import { MenuItem } from "../types";

export default function tableMenuItems(): MenuItem[] {
  return [
    {
      name: "deleteTable",
      tooltip: "Delete table",
      icon: TrashIcon,
      active: () => false,
    },
  ];
}
