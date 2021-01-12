import {
  TrashIcon,
  AlignImageRightIcon,
  AlignImageCenterIcon,
} from "outline-icons";
import isNodeActive from "../queries/isNodeActive";
import { MenuItem } from "../types";
import baseDictionary from "../dictionary";
import { EditorState } from "prosemirror-state";

export default function imageMenuItems(
  state: EditorState,
  dictionary: typeof baseDictionary
): MenuItem[] {
  const { schema } = state;
  const isRightAligned = isNodeActive(schema.nodes.image, {
    layoutClass: "right-50",
  });

  return [
    {
      name: "alignCenter",
      tooltip: dictionary.alignCenter,
      icon: AlignImageCenterIcon,
      visible: true,
      active: state =>
        isNodeActive(schema.nodes.image)(state) && !isRightAligned(state),
    },
    {
      name: "alignRight",
      tooltip: dictionary.alignRight,
      icon: AlignImageRightIcon,
      visible: true,
      active: isRightAligned,
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
