import Node from "./Node";
import React from "react";
export default abstract class ReactNode extends Node {
    abstract component({ node, isSelected, isEditable, innerRef, }: {
        node: any;
        isSelected: any;
        isEditable: any;
        innerRef: any;
    }): React.ReactElement;
}
//# sourceMappingURL=ReactNode.d.ts.map