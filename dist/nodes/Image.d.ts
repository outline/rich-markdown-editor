/// <reference types="react" />
import { Plugin } from "prosemirror-state";
import { InputRule } from "prosemirror-inputrules";
import Node from "./Node";
export default class Image extends Node {
    get name(): string;
    get schema(): {
        inline: boolean;
        attrs: {
            src: {};
            alt: {
                default: null;
            };
            layoutClass: {
                default: null;
            };
            title: {
                default: null;
            };
        };
        content: string;
        marks: string;
        group: string;
        selectable: boolean;
        draggable: boolean;
        parseDOM: {
            tag: string;
            getAttrs: (dom: HTMLDivElement) => {
                src: string | null;
                alt: string | null;
                title: string | null;
                layoutClass: string | null;
            };
        }[];
        toDOM: (node: any) => (string | any[] | {
            class: string;
        })[];
    };
    handleKeyDown: ({ node, getPos }: {
        node: any;
        getPos: any;
    }) => (event: any) => void;
    handleBlur: ({ node, getPos }: {
        node: any;
        getPos: any;
    }) => (event: any) => void;
    handleSelect: ({ getPos }: {
        getPos: any;
    }) => (event: any) => void;
    component: (props: any) => JSX.Element;
    toMarkdown(state: any, node: any): void;
    parseMarkdown(): {
        node: string;
        getAttrs: (token: any) => {
            layoutClass?: undefined;
            title?: undefined;
            src: any;
            alt: any;
        } | {
            layoutClass: any;
            title?: undefined;
            src: any;
            alt: any;
        } | {
            title: any;
            layoutClass?: undefined;
            src: any;
            alt: any;
        };
    };
    commands({ type }: {
        type: any;
    }): {
        deleteImage: () => (state: any, dispatch: any) => boolean;
        alignRight: () => (state: any, dispatch: any) => boolean;
        alignLeft: () => (state: any, dispatch: any) => boolean;
        alignCenter: () => (state: any, dispatch: any) => boolean;
        createImage: (attrs: any) => (state: any, dispatch: any) => boolean;
    };
    inputRules({ type }: {
        type: any;
    }): InputRule<any>[];
    get plugins(): Plugin<any, any>[];
}
//# sourceMappingURL=Image.d.ts.map