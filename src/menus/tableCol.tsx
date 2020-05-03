import { TrashIcon } from "outline-icons";

export default function tableColMenuItems() {
  return [
    {
      name: "deleteColumn",
      tooltip: "Delete column",
      icon: TrashIcon,
      active: () => true,
    },
  ];
}
