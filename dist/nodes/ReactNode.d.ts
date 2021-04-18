/// <reference types="react" />
import Node from "./Node";
export default abstract class ReactNode extends Node {
    abstract component({ node, isSelected, isEditable, innerRef, }: {
        node: any;
        isSelected: any;
        isEditable: any;
        innerRef: any;
    }): React.ReactElement;
}
//# sourceMappingURL=ReactNode.d.ts.map