import Node from "./Node";
import React from "react";

export default abstract class ReactNode extends Node {
  abstract component({
    node,
    isSelected,
    isEditable,
    innerRef,
  }): React.ReactElement;
}
