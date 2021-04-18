import * as React from "react";
import { EditorView, Decoration } from "prosemirror-view";
import Extension from "../lib/Extension";
import Node from "../nodes/Node";
import { light as lightTheme } from "../theme";
import Editor from "../";
declare type Component = (options: {
    node: Node;
    theme: typeof lightTheme;
    isSelected: boolean;
    isEditable: boolean;
    getPos: () => number;
}) => React.ReactElement;
export default class ComponentView {
    component: Component;
    editor: Editor;
    extension: Extension;
    node: Node;
    view: EditorView;
    getPos: () => number;
    decorations: Decoration<{
        [key: string]: any;
    }>[];
    isSelected: boolean;
    dom: HTMLElement | null;
    constructor(component: any, { editor, extension, node, view, getPos, decorations }: {
        editor: any;
        extension: any;
        node: any;
        view: any;
        getPos: any;
        decorations: any;
    });
    renderElement(): void;
    update(node: any): boolean;
    selectNode(): void;
    deselectNode(): void;
    stopEvent(): boolean;
    destroy(): void;
    ignoreMutation(): boolean;
}
export {};
//# sourceMappingURL=ComponentView.d.ts.map