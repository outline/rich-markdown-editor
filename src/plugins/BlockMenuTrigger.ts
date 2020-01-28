import { Plugin } from "prosemirror-state";
import { InputRule } from "prosemirror-inputrules";
import Extension from "../lib/Extension";

const MAX_MATCH = 500;
const INSERT_REGEX = /^\/(\w+)?$/;

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
  const tr = match && handler(state, match, from - match[0].length, to);
  if (!tr) return false;
  return true;
}

export default class BlockMenuTrigger extends Extension {
  get name() {
    return "blockmenu";
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          handleClick: () => {
            this.options.onClose();
            return false;
          },
          handleKeyDown: (view, event) => {
            // Prosemirror input rules are not triggered on backspace, however
            // we need them to be evaluted for the filter trigger to work
            // correctly. This additional handler adds inputrules-like handling.
            if (event.key === "Backspace") {
              // timeout ensures that the delete has been handled by prosemirror
              // and any characters removed, before we evaluate the rule.
              setTimeout(() => {
                const { pos } = view.state.selection.$from;
                return run(view, pos, pos, INSERT_REGEX, (state, match) => {
                  if (match) {
                    this.options.onOpen(match[1]);
                  }
                  return null;
                });
              });
            }

            // If the query is active and we're navigating the block menu then
            // just ignore the key events in the editor itself until we're done
            if (
              event.key === "Enter" ||
              event.key === "ArrowUp" ||
              event.key === "ArrowDown"
            ) {
              const { pos } = view.state.selection.$from;

              return run(view, pos, pos, INSERT_REGEX, () => {
                // just tell Prosemirror we handled it and not to do anything
                return true;
              });
            }

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
      new InputRule(INSERT_REGEX, (state, match) => {
        if (match) {
          this.options.onOpen(match[1]);
        }
        return null;
      }),
      // invert regex should match some of these scenarios:
      // /<space>word
      // /<space>
      // /word<space>
      new InputRule(
        /(^(?!\/(\w+)?)(.*)$|^\/((\w+)\s.*|\s)$)/,
        (state, match) => {
          if (match) {
            this.options.onClose();
          }
          return null;
        }
      ),
    ];
  }
}
