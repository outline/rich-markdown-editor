import {
  TrashIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlignCenterIcon,
  InsertLeftIcon,
  InsertRightIcon,
} from "outline-icons";
import { EditorState } from "prosemirror-state";
import isNodeActive from "../queries/isNodeActive";

export default function tableColMenuItems(state: EditorState, index) {
  const { schema } = state;

  return [
    {
      name: "setColumnAttr",
      tooltip: "Align left",
      icon: AlignLeftIcon,
      attrs: { index, alignment: "left" },
      active: isNodeActive(schema.nodes.th, {
        colspan: 1,
        rowspan: 1,
        alignment: "left",
      }),
    },
    {
      name: "setColumnAttr",
      tooltip: "Align center",
      icon: AlignCenterIcon,
      attrs: { index, alignment: "center" },
      active: isNodeActive(schema.nodes.th, {
        colspan: 1,
        rowspan: 1,
        alignment: "center",
      }),
    },
    {
      name: "setColumnAttr",
      tooltip: "Align right",
      icon: AlignRightIcon,
      attrs: { index, alignment: "right" },
      active: isNodeActive(schema.nodes.th, {
        colspan: 1,
        rowspan: 1,
        alignment: "right",
      }),
    },
    {
      name: "separator",
    },
    {
      name: "addColumnBefore",
      tooltip: "Insert column before",
      icon: InsertLeftIcon,
      active: () => false,
    },
    {
      name: "addColumnAfter",
      tooltip: "Insert column after",
      icon: InsertRightIcon,
      active: () => false,
    },
    {
      name: "separator",
    },
    {
      name: "deleteColumn",
      tooltip: "Delete column",
      icon: TrashIcon,
      active: () => false,
    },
  ];
}
