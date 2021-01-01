import {
  TrashIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlignCenterIcon,
} from "outline-icons";
import { MenuItem } from "../types";
import baseDictionary from "../dictionary";

export default function imageMenuItems(
  dictionary: typeof baseDictionary
): MenuItem[] {
  return [
    {
      name: "deleteImage",
      tooltip: dictionary.deleteImage,
      icon: TrashIcon,
      visible: true,
      active: () => false,
    },
    {
      name: "separator",
      visible: true,
    },
    {
      name: "alignLeft",
      tooltip: dictionary.alignLeft,
      icon: AlignLeftIcon,
      visible: true,
      active: () => false,
    },
    {
      name: "alignCenter",
      tooltip: dictionary.alignCenter,
      icon: AlignCenterIcon,
      visible: true,
      active: () => false,
    },
    {
      name: "alignRight",
      tooltip: dictionary.alignRight,
      icon: AlignRightIcon,
      visible: true,
      active: () => false,
    },
  ];
}
