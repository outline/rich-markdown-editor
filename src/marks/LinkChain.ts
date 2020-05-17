import { toggleMark } from "prosemirror-commands";
import { Plugin } from "prosemirror-state";
import { InputRule } from "prosemirror-inputrules";
import Mark from "./Mark";

const LINK_CHAIN_INPUT_REGEX = /<#(.+?)>/;

export default class LinkChain extends Mark {
  get name() {
    return "link_chain";
  }

  get schema() {
    return {
      attrs: {
        refs: {
          default: "",
        },
      },
      inclusive: false,
      toDOM: node => {
        return [
        "span",
        {},
        ...node.attrs.refs.split("#").map((partUrl, idx) => [
            "a",
            {
              ...node.attrs,
              href: `#${partUrl}`,
              rel: "noopener noreferrer nofollow",
            },
            idx ? `#${partUrl}` : 0,
          ]
        )
      ]}
    };
  }

  inputRules({ type }) {
    return [
      new InputRule(LINK_CHAIN_INPUT_REGEX, (state, match, start, end) => {
        const [okay, refs] = match;
        const { tr } = state;

        if (okay) {
          const txt = `#${refs.split("#")[0]}`;
          tr.replaceWith(start, end, this.editor.schema.text(txt)).addMark(
            start,
            start + txt.length,
            type.create({ refs })
          );
        }

        return tr;
      }),
    ];
  }

  commands({ type }) {
    return ({ refs } = { refs: "" }) => toggleMark(type, { refs });
  }

  keys({ type }) {
    return {
      "Mod-k": toggleMark(type, { refs: "" }),
    };
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            click: (view, event: MouseEvent) => {
              if (event.target instanceof HTMLAnchorElement) {
                const { href } = event.target;

                const isHashtag = href.startsWith("#");
                if (isHashtag && this.options.onClickHashtag) {
                  event.stopPropagation();
                  event.preventDefault();
                  this.options.onClickHashtag(href);
                  return true;
                }

                if (this.options.onClickLink) {
                  event.stopPropagation();
                  event.preventDefault();
                  this.options.onClickLink(href);
                  return true;
                }
              }
            },
          },
        },
      }),
    ];
  }

  get toMarkdown() {
    return {
      open(_state, mark, parent, index) {
        return `<`;
      },
      close(state, mark, parent, index) {
        return `#${state.esc(mark.attrs.refs.split("#").slice(1).join("#"))}>`;
      },
    };
  }

  parseMarkdown() {
    return {
      mark: "link_chain",
      getAttrs: tok => ({
        refs: tok.attrGet("refs"),
      }),
    };
  }
}
