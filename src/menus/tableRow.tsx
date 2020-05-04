import { TrashIcon, InsertAboveIcon, InsertBelowIcon } from "outline-icons";

export default function tableColMenuItems() {
  return [
    {
      name: "addRowBefore",
      tooltip: "Insert column before",
      icon: InsertAboveIcon,
      active: () => false,
    },
    {
      name: "addRowAfter",
      tooltip: "Insert column after",
      icon: InsertBelowIcon,
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
