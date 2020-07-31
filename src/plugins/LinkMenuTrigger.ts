import { Plugin } from "prosemirror-state";
import { InputRule } from "prosemirror-inputrules";
import Extension from "../lib/Extension";

const OPEN_REGEX = /^.+\/$/;

export default class LinkMenuTrigger extends Extension {
  get name() {
    return "linkmenu";
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          handleClick: () => {
            this.options.onClose();
            return false;
          },
        },
      }),
    ];
  }

  inputRules() {
    return [
      // main regex should match only:
      // /word
      new InputRule(OPEN_REGEX, (state, match) => {
        if (match && state.selection.$from.parent.type.name === "paragraph") {
          this.options.onOpen(true);
        }
        return null;
      }),
    ];
  }
}
