import { toggleMark } from "prosemirror-commands";
import markInputRule from "../lib/markInputRule";
import Mark from "./Mark";
// import { Plugin } from "prosemirror-state";
import { getText } from "../components/SelectionToolbar";

function markApplies(doc, ranges, type) {
  for (let i = 0; i < ranges.length; i++) {
    let {$from, $to} = ranges[i]
    let can = $from.depth == 0 ? doc.type.allowsMarkType(type) : false
    doc.nodesBetween($from.pos, $to.pos, node => {
      if (can) return false
      can = node.inlineContent && node.type.allowsMarkType(type)
    })
    if (can) return true
  }
  return false
}

export default class Highlight extends Mark {
  onHighlight: (text: string) => void;
  constructor({ onHighlight = text => {} } = {}) {
    super();
    this.onHighlight = onHighlight;
  }

  get name() {
    return "mark";
  }

  get schema() {
    return {
      parseDOM: [{ tag: "mark" }],
      toDOM: () => ["mark"],
    };
  }

  inputRules({ type }) {
    return [markInputRule(/(?:==)([^=]+)(?:==)$/, type)];
  }

  keys({ type }) {
    return {
      "Mod-Ctrl-h": toggleMark(type),
    };
  }

  get toMarkdown() {
    return {
      open: "==",
      close: "==",
      mixable: true,
      expelEnclosingWhitespace: true,
    };
  }

  parseMarkdown() {
    return { mark: "mark"};
  }

  // get plugins() {
  //   return [
  //     new Plugin({
  //       props: {
  //         // could add hover events here (would be one way traffic though)
  //         handleDOMEvents: {
  //           // FIXME check whether tag is mark, if not go to parent node until found
  //           click: (view, event: MouseEvent) => console.log(`click highlight`, view, event.target?.parentNode?.innerText),
  //         }
  //       }
  //     })
  //   ];
  // }

  commands({ type }) {
    return () => {
      return (state, dispatch) => {
        // inlined toggleMark so can add question only when adding https://github.com/ProseMirror/prosemirror-commands/blob/master/src/commands.js#L488
          let {empty, $cursor, ranges} = state.selection
            if ((empty && !$cursor) || !markApplies(state.doc, ranges, type)) return false
            if (dispatch) {
              if ($cursor) {
                if (type.isInSet(state.storedMarks || $cursor.marks()))
                  dispatch(state.tr.removeStoredMark(type))
                else
                  dispatch(state.tr.addStoredMark(type.create({})))
              } else {
                let has = false, tr = state.tr
                for (let i = 0; !has && i < ranges.length; i++) {
                  let {$from, $to} = ranges[i]
                  has = state.doc.rangeHasMark($from.pos, $to.pos, type)
                }
                for (let i = 0; i < ranges.length; i++) {
                  let {$from, $to} = ranges[i]
                  if (has) tr.removeMark($from.pos, $to.pos, type)
                  else tr.addMark($from.pos, $to.pos, type.create({}))
                }
                if (!has) {
                  const selectionContent = state.selection.content();
                  const selectedText = getText(selectionContent);
                  console.log(`prompt selection 1`, selectedText);
                  this.onHighlight(selectedText);
                }
                dispatch(tr.scrollIntoView())
              }
            }
            return true
        }
      }
  }
}
