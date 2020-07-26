import { toggleMark } from "prosemirror-commands";
import markInputRule from "../lib/markInputRule";
import Mark from "./Mark";

export default class Placeholder extends Mark {
  get name() {
    return "placeholder";
  }

  get schema() {
    return {
      parseDOM: [{ tag: "span.template-placeholder" }],
      toDOM: () => ["span", { class: "template-placeholder" }],
    };
  }

  inputRules({ type }) {
    return [markInputRule(/(?:\<\<)([^<>]+)(?:\>\>)$/, type)];
  }

  get toMarkdown() {
    return {
      open: "<<",
      close: ">>",
      mixable: true,
      expelEnclosingWhitespace: true,
    };
  }

  parseMarkdown() {
    return { mark: "placeholder" };
  }
}
