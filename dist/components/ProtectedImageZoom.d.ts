import * as React from "react";
import { ImageZoomProps } from "react-medium-image-zoom";
interface IState {
    imageUrl: string;
}
interface IProps {
    title: string;
}
export declare class ProtectedImageZoom extends React.Component<IProps & ImageZoomProps, IState> {
    constructor(props: any);
    componentDidMount(): Promise<void>;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=ProtectedImageZoom.d.ts.map