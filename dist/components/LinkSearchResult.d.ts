import * as React from "react";
declare type Props = {
    onClick: (event: React.MouseEvent) => void;
    onMouseOver: (event: React.MouseEvent) => void;
    icon: React.ReactNode;
    selected: boolean;
    title: string;
    subtitle?: string;
};
declare function LinkSearchResult({ title, subtitle, selected, icon, ...rest }: Props): JSX.Element;
export default LinkSearchResult;
//# sourceMappingURL=LinkSearchResult.d.ts.map