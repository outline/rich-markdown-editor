import { MarkdownSerializerState } from "prosemirror-markdown";
import { Node as ProsemirrorNode } from "prosemirror-model";
import Extension from "../lib/Extension";

export default class Node extends Extension {
  component?: Function;

  constructor(options: Record<string, any> = {}) {
    super(options);
  }

  get type() {
    return "node";
  }

  get schema(): Record<string, any> {
    return null;
  }

  get markdownToken(): string {
    return "";
  }

  toMarkdown(state: MarkdownSerializerState, node: ProsemirrorNode) {
    console.error("toMarkdown not defined", state, node);
  }

  parseMarkdown() {
    // no implementation
  }

  command() {
    return () => {
      // no implementation
    };
  }
}
