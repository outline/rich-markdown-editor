import { Plugin } from "prosemirror-state";
import { InputRule } from "prosemirror-inputrules";
import Extension from "../lib/Extension";

const MAX_MATCH = 500;
const OPEN_REGEX = /(\S+)$/;
const CLOSE_REGEX = /(\s|^|^\/(\w+)?)$/;
// This should simply determine whether searchMenu should be open (mostly yes) and what to search for

// based on the input rules code in Prosemirror, here:
// https://github.com/ProseMirror/prosemirror-inputrules/blob/master/src/inputrules.js
function run(view, from, to, regex, handler) {
  if (view.composing) {
    return false;
  }
  const state = view.state;
  const $from = state.doc.resolve(from);
  if ($from.parent.type.spec.code) {
    return false;
  }

  const textBefore = $from.parent.textBetween(
    Math.max(0, $from.parentOffset - MAX_MATCH),
    $from.parentOffset,
    null,
    "\ufffc"
  );

  const match = regex.exec(textBefore);
  const tr = handler(state, match, match ? from - match[0].length : from, to);
  if (!tr) return false;
  return true;
}

export default class SearchTrigger extends Extension {
  get name() {
    return "search";
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          handleKeyDown: (view, event) => {
            // Prosemirror input rules are not triggered on backspace, however
            // we need them to be evaluted for the filter trigger to work
            // correctly. This additional handler adds inputrules-like handling.
            if (event.key === "Backspace") {
              // timeout ensures that the delete has been handled by prosemirror
              // and any characters removed, before we evaluate the rule.
              setTimeout(() => {
                const { pos } = view.state.selection.$from;
                return run(view, pos, pos, OPEN_REGEX, (state, match) => {
                  if (match) {
                    this.options.onOpen(match[1]);
                  } else {
                    this.options.onClose();
                  }
                  return null;
                });
              });
            }

            if (
              event.key === "Escape"
            ) {
              this.options.onClose();
            }

            return false;
          },
        },
      }),
    ];
  }

  inputRules() {
    return [
      new InputRule(OPEN_REGEX, (state, match) => {
        if (match) {
          this.options.onOpen(match[1]);
        }
        return null;
      }),
      new InputRule(CLOSE_REGEX, (state, match) => {
        if (match) {
          this.options.onClose();
        }
        return null;
      }),
    ];
  }
}
