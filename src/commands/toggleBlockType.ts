import { setBlockType } from "prosemirror-commands";
import isNodeActive from "../queries/isNodeActive";

export default function toggleBlockType(type, toggleType, attrs = {}) {
  return (state, dispatch) => {
    const isActive = isNodeActive(type, attrs)(state);

    if (isActive) {
      return setBlockType(toggleType)(state, dispatch);
    }

    return setBlockType(type, attrs)(state, dispatch);
  };
}
