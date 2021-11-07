import { toggleMark } from "prosemirror-commands";
import { Plugin } from "prosemirror-state";
import { InputRule } from "prosemirror-inputrules";
import Mark from "./Mark";
import { getText } from "../components/SelectionToolbar";

function markApplies(doc, ranges, type) {
  for (let i = 0; i < ranges.length; i++) {
    const { $from, $to } = ranges[i];
    let can = $from.depth === 0 ? doc.type.allowsMarkType(type) : false;
    doc.nodesBetween($from.pos, $to.pos, node => {
      if (can) return false;
      can = node.inlineContent && node.type.allowsMarkType(type);
    });
    if (can) return true;
  }
  return false;
}

const LINK_INPUT_REGEX = /\[(.+)]\((\S+)\)/;

function isPlainURL(link, parent, index, side) {
  if (link.attrs.title || !/^\w+:/.test(link.attrs.href)) {
    return false;
  }

  const content = parent.child(index + (side < 0 ? -1 : 0));
  if (
    !content.isText ||
    content.text !== link.attrs.href ||
    content.marks[content.marks.length - 1] !== link
  ) {
    return false;
  }

  if (index === (side < 0 ? 1 : parent.childCount - 1)) {
    return true;
  }

  const next = parent.child(index + (side < 0 ? -2 : 1));
  return !link.isInSet(next.marks);
}

export default class Link extends Mark {
  get name() {
    return "link";
  }

  get schema() {
    return {
      attrs: {
        href: {
          default: "",
        },
      },
      inclusive: false,
      parseDOM: [
        {
          tag: "a[href]",
          getAttrs: (dom: HTMLElement) => ({
            href: dom.getAttribute("href"),
          }),
        },
      ],
      toDOM: node => [
        "a",
        {
          ...node.attrs,
          rel: "noopener noreferrer nofollow",
        },
        0,
      ],
    };
  }

  inputRules({ type }) {
    return [
      new InputRule(LINK_INPUT_REGEX, (state, match, start, end) => {
        const [okay, alt, href] = match;
        const { tr } = state;

        if (okay) {
          tr.replaceWith(start, end, this.editor.schema.text(alt)).addMark(
            start,
            start + alt.length,
            type.create({ href })
          );
        }

        return tr;
      }),
    ];
  }

  commands({ type }) {
    return ({ href } = { href: "" }) => {
      return (state, dispatch) => {
        // inlined toggleMark so can add link when nothing selected https://github.com/ProseMirror/prosemirror-commands/blob/master/src/commands.js#L488
        const { empty, $cursor, ranges } = state.selection;
        if ((empty && !$cursor) || !markApplies(state.doc, ranges, type))
          return false;
        if (empty) {
          this.options.onKeyboardShortcut();
        }
        if (dispatch) {
          if ($cursor) {
            if (type.isInSet(state.storedMarks || $cursor.marks()))
              dispatch(state.tr.removeStoredMark(type));
            else dispatch(state.tr.addStoredMark(type.create({ href })));
          } else {
            let has = false,
              tr = state.tr;
            for (let i = 0; !has && i < ranges.length; i++) {
              const { $from, $to } = ranges[i];
              has = state.doc.rangeHasMark($from.pos, $to.pos, type);
            }
            for (let i = 0; i < ranges.length; i++) {
              const { $from, $to } = ranges[i];
              if (has) tr.removeMark($from.pos, $to.pos, type);
              else tr.addMark($from.pos, $to.pos, type.create({ href }));
            }
            dispatch(tr.scrollIntoView());
          }
        }
        return true;
      };
    };
  }

  keys({ type }) {
    return {
      "Mod-k": (state, dispatch) => {
        if (state.selection.empty) {
          this.options.onKeyboardShortcut();
          return true;
        }

        return toggleMark(type, { href: "" })(state, dispatch);
      },
    };
  }

  get plugins() {
    const onStart = (view, event: MouseEvent) => {
      if (event.target instanceof HTMLAnchorElement) {
        (window as any).TOUCHLINKMOVED = false;
        return true;
      }
      return false;
    };
    const onMove = (view, event: MouseEvent) => {
      if (
        event.target instanceof HTMLAnchorElement &&
        !(window as any).TOUCHLINKMOVED
      ) {
        (window as any).TOUCHLINKMOVED = true;
        return true;
      }
      return false;
    };
    const onEnd = (view, event: MouseEvent, preventDefault = false) => {
      if (
        event.target instanceof HTMLAnchorElement &&
        !(window as any).TOUCHLINKMOVED
      ) {
        preventDefault && event.preventDefault();
        const { href } = event.target;

        // check text selection, if text selected don't do anything
        const selectionContent = view?.state?.selection?.content();
        const selectedText = selectionContent && getText(selectionContent);
        if (!selectedText) {
          const isHashtag = href.startsWith("#");
          if (isHashtag && this.options.onClickHashtag) {
            this.options.onClickHashtag(href, event);
            return true;
          }

          if (this.options.onClickLink) {
            this.options.onClickLink(href, event);
            return true;
          }
        }
      }
      return false;
    };
    return [
      new Plugin({
        props: {
          // could add hover events here (would be one way traffic though)
          handleDOMEvents: {
            touchstart: onStart,
            mousedown: onStart,
            touchmove: onMove,
            mousemove: onMove,
            touchend: (view, event: MouseEvent) => onEnd(view, event, true),
            mouseup: (view, event: MouseEvent) => onEnd(view, event),
            mouseover: (view, event: MouseEvent) => {
              if (
                event.target instanceof HTMLAnchorElement &&
                !event.target.className.includes("ProseMirror-widget")
              ) {
                if (this.options.onHoverLink) {
                  return this.options.onHoverLink(event);
                }
              }
              return false;
            },
            click: (view, event: MouseEvent) => {
              if (event.target instanceof HTMLAnchorElement) {
                if (this.options.onClickLink) {
                  event.stopPropagation();
                  event.preventDefault();
                  // this is now handled by onend, but we still need to preventDefault to prevent sending link to server
                  // this.options.onClickLink(href, event);
                }
                return true;
              }
              return false;
            },
          },
        },
      }),
    ];
  }

  get toMarkdown() {
    return {
      open(_state, mark, parent, index) {
        return isPlainURL(mark, parent, index, 1) ? "<" : "[";
      },
      close(state, mark, parent, index) {
        return isPlainURL(mark, parent, index, -1)
          ? ">"
          : "](" +
              state.esc(mark.attrs.href) +
              (mark.attrs.title ? " " + state.quote(mark.attrs.title) : "") +
              ")";
      },
    };
  }

  parseMarkdown() {
    return {
      mark: "link",
      getAttrs: tok => ({
        href: tok.attrGet("href"),
        title: tok.attrGet("title") || null,
      }),
    };
  }
}
