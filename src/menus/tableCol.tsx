import {
  TrashIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlignCenterIcon,
} from "outline-icons";

export default function tableColMenuItems(index) {
  return [
    {
      name: "setColumnAttr",
      tooltip: "Align left",
      icon: AlignLeftIcon,
      attrs: { index, alignment: "left" },
      active: () => true,
    },
    {
      name: "setColumnAttr",
      tooltip: "Align center",
      icon: AlignCenterIcon,
      attrs: { index, alignment: "center" },
      active: () => true,
    },
    {
      name: "setColumnAttr",
      tooltip: "Align right",
      icon: AlignRightIcon,
      attrs: { index, alignment: "right" },
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
