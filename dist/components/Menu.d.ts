import * as React from "react";
import { EditorView } from "prosemirror-view";
import theme from "../theme";
import { MenuItem } from "../types";
declare type Props = {
    tooltip: typeof React.Component | React.FC<any>;
    commands: Record<string, any>;
    view: EditorView;
    theme: typeof theme;
    items: MenuItem[];
};
declare class Menu extends React.Component<Props> {
    render(): JSX.Element;
}
declare const _default: React.ForwardRefExoticComponent<Pick<Props & React.RefAttributes<Menu>, "view" | "tooltip" | "ref" | "key" | "commands" | "items"> & {
    theme?: any;
}>;
export default _default;
//# sourceMappingURL=Menu.d.ts.map