import * as React from "react";
import theme from "../theme";
declare type Props = {
    selected: boolean;
    disabled?: boolean;
    onClick: () => void;
    theme: typeof theme;
    icon: typeof React.Component | React.FC<any>;
    title: string;
    shortcut?: string;
};
declare const _default: React.ForwardRefExoticComponent<Pick<Props, "disabled" | "title" | "icon" | "onClick" | "selected" | "shortcut"> & {
    theme?: any;
}>;
export default _default;
//# sourceMappingURL=BlockMenuItem.d.ts.map