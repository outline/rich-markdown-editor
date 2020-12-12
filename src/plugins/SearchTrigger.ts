import { Plugin } from "prosemirror-state";
import { InputRule } from "prosemirror-inputrules";
import Extension from "../lib/Extension";

// keep always open and match whole line. Component decides when to hide (ie render null)
const OPEN_REGEX = /^(.*)?\[\[$/;

export default class SearchTrigger extends Extension {
  get name() {
    return "search";
  }

  get plugins() {
    return [
      new Plugin({
        props: {},
      }),
    ];
  }

  inputRules() {
    return [
      new InputRule(OPEN_REGEX, (state, match) => {
        if (match) {
          this.options.onOpen(match[1] || "");
        }
        return null;
      }),
    ];
  }
}
