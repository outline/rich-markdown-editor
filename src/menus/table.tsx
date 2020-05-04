import { TrashIcon } from "outline-icons";

export default function tableMenuItems() {
  return [
    {
      name: "deleteTable",
      tooltip: "Delete table",
      icon: TrashIcon,
      active: () => false,
    },
  ];
}
