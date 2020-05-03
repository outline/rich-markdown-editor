import {
  TrashIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlignCenterIcon,
} from "outline-icons";

export default function tableColMenuItems() {
  return [
    {
      name: "setColumnAttr",
      tooltip: "Align left",
      icon: AlignLeftIcon,
      attrs: { alignment: "left" },
      active: () => true,
    },
    {
      name: "setColumnAttr",
      tooltip: "Align center",
      icon: AlignCenterIcon,
      attrs: { alignment: "center" },
      active: () => true,
    },
    {
      name: "setColumnAttr",
      tooltip: "Align right",
      icon: AlignRightIcon,
      attrs: { alignment: "right" },
      active: () => true,
    },
    {
      name: "separator",
    },
    {
      name: "deleteColumn",
      tooltip: "Delete column",
      icon: TrashIcon,
      active: () => true,
    },
  ];
}
