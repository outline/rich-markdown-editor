// @flow
import ReactDOM from "react-dom";

export default class NodeView {
  isSelected: boolean = false;
  dom: HTMLDivElement | HTMLSpanElement;
  options: Object;

  // See: https://prosemirror.net/docs/ref/#view.NodeView
  constructor(node, view, getPos, decorations, options) {
    this.view = view;
    this.node = node;
    this.options = options;
    this.isSelected = false;
    this.dom = node.type.spec.inline
      ? document.createElement("span")
      : document.createElement("div");
    this.renderElement();
  }

  renderElement() {
    ReactDOM.render(
      this.node.type.spec.toStatic(
        this.node,
        this.options,
        this.isSelected,
        this.view.editable,
        null,
        null
      ),
      this.dom
    );
  }

  update(updateNode) {
    if (updateNode.type !== this.node.type) return false;
    this.node = updateNode;
    this.renderElement();
    return true;
  }

  selectNode() {
    if (!this.view.editable) return;
    this.isSelected = true;
    this.renderElement();
  }

  deselectNode() {
    if (!this.view.editable) return;
    this.isSelected = false;
    this.renderElement();
  }

  stopEvent(ev: Event) {
    return (
      ev.type === "keypress" ||
      ev.type === "input" ||
      ev.type === "keydown" ||
      ev.type === "keyup" ||
      ev.type === "paste"
    );
  }

  destroy() {
    ReactDOM.unmountComponentAtNode(this.dom);
  }

  ignoreMutation() {
    return true;
  }
}
