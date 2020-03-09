import * as React from "react";
import ReactDOM from "react-dom";
import { ThemeProvider } from "styled-components";
import { EditorView, Decoration } from "prosemirror-view";
import Extension from "../lib/Extension";
import Node from "../nodes/Node";
import { light as lightTheme, dark as darkTheme } from "../theme";
import Editor from "../";

type Component = (options: {
  node: Node;
  theme: typeof lightTheme;
  isSelected: boolean;
  isEditable: boolean;
  getPos: () => number;
  innerRef: (HTMLElement) => void;
}) => React.ReactElement;

export default class ComponentView {
  component: Component;
  editor: Editor;
  extension: Extension;
  node: Node;
  view: EditorView;
  getPos: () => number;
  decorations: Decoration<{ [key: string]: any }>[];
  isSelected = false;
  containerElement: HTMLElement;
  contentElement: HTMLElement;
  dom: HTMLElement;
  contentDOM: HTMLElement;

  // See https://prosemirror.net/docs/ref/#view.NodeView
  constructor(
    component,
    { editor, extension, node, view, getPos, decorations }
  ) {
    this.component = component;
    this.editor = editor;
    this.extension = extension;
    this.getPos = getPos;
    this.decorations = decorations;
    this.node = node;
    this.view = view;
    this.containerElement = node.type.spec.inline
      ? document.createElement("span")
      : document.createElement("div");

    this.contentElement = node.type.spec.inline
      ? document.createElement("span")
      : document.createElement("div");

    this.renderElement();
    this.dom = this.containerElement;
    this.contentDOM = this.contentElement;
  }

  renderElement() {
    const { dark } = this.editor.props;
    const theme = this.editor.props.theme || (dark ? darkTheme : lightTheme);

    const children = this.component({
      theme,
      node: this.node,
      isSelected: this.isSelected,
      isEditable: this.view.editable,
      getPos: this.getPos,
      innerRef: node => {
        // move the contentDOM node inside the inner reference after rendering
        if (node && this.contentDOM && !node.contains(this.contentDOM)) {
          node.appendChild(this.contentDOM);
        }
      },
    });

    ReactDOM.render(
      <ThemeProvider theme={theme}>{children}</ThemeProvider>,
      this.containerElement
    );
  }

  update(node) {
    if (node.type !== this.node.type) {
      return false;
    }

    this.node = node;
    this.renderElement();
    return true;
  }

  selectNode() {
    if (this.view.editable) {
      this.isSelected = true;
      this.renderElement();
    }
  }

  deselectNode() {
    if (this.view.editable) {
      this.isSelected = false;
      this.renderElement();
    }
  }

  stopEvent(ev: Event) {
    return (
      ev.type === "keypress" ||
      ev.type === "keydown" ||
      ev.type === "keyup" ||
      ev.type === "input" ||
      ev.type === "paste"
    );
  }

  destroy() {
    ReactDOM.unmountComponentAtNode(this.containerElement);
    this.containerElement = null;
    this.contentElement = null;
  }

  ignoreMutation() {
    return true;
  }
}
