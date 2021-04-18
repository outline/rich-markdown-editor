import * as React from "react";
import { EditorView } from "prosemirror-view";
import { EmbedDescriptor, MenuItem } from "../types";
import baseDictionary from "../dictionary";
declare type Props = {
    isActive: boolean;
    commands: Record<string, any>;
    dictionary: typeof baseDictionary;
    view: EditorView;
    search: string;
    uploadImage?: (file: File) => Promise<string>;
    onImageUploadStart?: () => void;
    onImageUploadStop?: () => void;
    onShowToast?: (message: string, id: string) => void;
    onLinkToolbarOpen: () => void;
    onClose: () => void;
    embeds: EmbedDescriptor[];
};
declare type State = {
    insertItem?: EmbedDescriptor;
    left?: number;
    top?: number;
    bottom?: number;
    isAbove: boolean;
    selectedIndex: number;
};
declare class BlockMenu extends React.Component<Props, State> {
    menuRef: React.RefObject<HTMLDivElement>;
    inputRef: React.RefObject<HTMLInputElement>;
    state: State;
    componentDidMount(): void;
    shouldComponentUpdate(nextProps: any, nextState: any): boolean;
    componentDidUpdate(prevProps: any): void;
    componentWillUnmount(): void;
    handleKeyDown: (event: KeyboardEvent) => void;
    insertItem: (item: any) => void;
    close: () => void;
    handleLinkInputKeydown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    handleLinkInputPaste: (event: React.ClipboardEvent<HTMLInputElement>) => void;
    triggerImagePick: () => void;
    triggerLinkInput: (item: any) => void;
    handleImagePicked: (event: any) => void;
    clearSearch(): void;
    insertBlock(item: any): void;
    get caretPosition(): {
        top: number;
        left: number;
    };
    calculatePosition(props: any): {
        left: number;
        top: undefined;
        bottom: number;
        isAbove: boolean;
    } | {
        left: number;
        top: any;
        bottom: undefined;
        isAbove: boolean;
    };
    get filtered(): MenuItem[];
    render(): JSX.Element;
}
export declare const Wrapper: import("styled-components").StyledComponent<"div", any, {
    active: boolean;
    top?: number | undefined;
    bottom?: number | undefined;
    left?: number | undefined;
    isAbove: boolean;
}, never>;
export default BlockMenu;
//# sourceMappingURL=BlockMenu.d.ts.map