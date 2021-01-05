import {
  TrashIcon,
  AlignImageLeftIcon,
  AlignImageRightIcon,
  AlignImageCenterIcon,
} from "outline-icons";
import { MenuItem } from "../types";
import baseDictionary from "../dictionary";

export default function imageMenuItems(
  dictionary: typeof baseDictionary
): MenuItem[] {
  return [
    {
      name: "alignLeft",
      tooltip: dictionary.alignLeft,
      icon: AlignImageLeftIcon,
      visible: true,
      active: () => false,
    },
    {
      name: "alignCenter",
      tooltip: dictionary.alignCenter,
      icon: AlignImageCenterIcon,
      visible: true,
      active: () => false,
    },
    {
      name: "alignRight",
      tooltip: dictionary.alignRight,
      icon: AlignImageRightIcon,
      visible: true,
      active: () => false,
    },
    {
      name: "separator",
      visible: true,
    },
    {
      name: "deleteImage",
      tooltip: dictionary.deleteImage,
      icon: TrashIcon,
      visible: true,
      active: () => false,
    },
  ];
}
