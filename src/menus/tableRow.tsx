import { TrashIcon } from "outline-icons";

export default function tableColMenuItems() {
  return [
    {
      name: "deleteRow",
      tooltip: "Delete row",
      icon: TrashIcon,
      active: () => false,
    },
  ];
}
