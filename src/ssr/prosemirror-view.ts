import { DirectEditorProps, EditorView } from "prosemirror-view";
import { EditorState, Transaction } from "prosemirror-state";
import { Schema } from "prosemirror-model";

type EditorSchema<
  Nodes extends string = string,
  Marks extends string = string
> = Schema<Nodes, Marks>;

/**
 * A mock editor view used only when prosemirror is running on the server
 */
export class EditorViewSSR<Schema extends EditorSchema = any> {
  state: EditorState;
  dom: Element;
  dragging = null;
  root: Document | DocumentFragment;

  constructor(
    place: Node | ((p: Node) => void) | { mount: Node } | undefined,
    props: DirectEditorProps<EditorSchema>
  ) {
    const doc = require("min-document"); // eslint-disable-line @typescript-eslint/no-var-requires
    this.root = doc;
    this.dom = doc.createElement("div");
    this.state = props.state;
  }

  update(_props: DirectEditorProps<Schema>): void {}
  setProps(_props: DirectEditorProps<Schema>): void {}
  updateState(_state: EditorState): void {}
  someProp(_propName: string, f?: (prop: any) => any): any {
    return f ? f(null) : null;
  }
  hasFocus(): boolean {
    return false;
  }
  focus(): void {}
  posAtCoords(_coords: {
    left: number;
    top: number;
  }): { pos: number; inside: number } | null | undefined {
    return null;
  }
  coordsAtPos(
    _pos: number
  ): { left: number; right: number; top: number; bottom: number } {
    return { bottom: 0, left: 0, right: 0, top: 0 };
  }
  domAtPos(_pos: number): { node: Node; offset: number } {
    return { node: this.dom, offset: 0 };
  }
  nodeDOM(_pos: number): Node | null | undefined {
    return null;
  }
  posAtDOM(_node: Node, _offset: number, _bias?: number | null): number {
    return 0;
  }
  endOfTextblock(
    _dir: "up" | "down" | "left" | "right" | "forward" | "backward",
    _state?: EditorState
  ): boolean {
    return true;
  }
  destroy(): void {}
  dispatch(_tr: Transaction): void {}
}

export const createEditorView = <Schema extends EditorSchema = any>(
  place: Node | ((p: Node) => void) | { mount: Node } | undefined,
  props: DirectEditorProps<Schema>
): EditorView<Schema> => {
  const Constructor =
    typeof window !== "undefined" ? EditorView : EditorViewSSR;

  // @ts-ignore
  return new Constructor(place, props) as any;
};
