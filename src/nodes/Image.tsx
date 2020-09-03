import * as React from "react";
import { Plugin } from "prosemirror-state";
import { InputRule } from "prosemirror-inputrules";
import { setTextSelection } from "prosemirror-utils";
import styled from "styled-components";
import ImageZoom from "react-medium-image-zoom";
import getDataTransferFiles from "../lib/getDataTransferFiles";
import uploadPlaceholderPlugin from "../lib/uploadPlaceholder";
import insertFiles from "../commands/insertFiles";
import Node from "./Node";

/**
 * Matches following attributes in Markdown-typed image: [, alt, src, title]
 *
 * Example:
 * ![Lorem](image.jpg) -> [, "Lorem", "image.jpg"]
 * ![](image.jpg "Ipsum") -> [, "", "image.jpg", "Ipsum"]
 * ![Lorem](image.jpg "Ipsum") -> [, "Lorem", "image.jpg", "Ipsum"]
 */
const IMAGE_INPUT_REGEX = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

const uploadPlugin = options =>
  new Plugin({
    props: {
      handleDOMEvents: {
        paste(view, event: ClipboardEvent): boolean {
          if (view.props.editable && !view.props.editable(view.state)) {
            return false;
          }

          if (!event.clipboardData) return false;

          // check if we actually pasted any files
          const files = Array.prototype.slice
            .call(event.clipboardData.items)
            .map(dt => dt.getAsFile())
            .filter(file => file);

          if (files.length === 0) return false;

          const { tr } = view.state;
          if (!tr.selection.empty) {
            tr.deleteSelection();
          }
          const pos = tr.selection.from;

          insertFiles(view, event, pos, files, options);
          return true;
        },
        drop(view, event: DragEvent): boolean {
          if (view.props.editable && !view.props.editable(view.state)) {
            return false;
          }

          // filter to only include image files
          const files = getDataTransferFiles(event).filter(file =>
            /image/i.test(file.type)
          );
          if (files.length === 0) {
            return false;
          }

          // grab the position in the document for the cursor
          const result = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          if (result) {
            insertFiles(view, event, result.pos, files, options);
            return true;
          }

          return false;
        },
      },
    },
  });

export default class Image extends Node {
  get name() {
    return "image";
  }

  get schema() {
    return {
      inline: true,
      attrs: {
        src: {},
        alt: {
          default: null,
        },
      },
      content: "text*",
      marks: "",
      group: "inline",
      draggable: true,
      parseDOM: [
        {
          tag: "div[class=image]",
          getAttrs: (dom: HTMLElement) => {
            const img = dom.getElementsByTagName("img")[0];
            const caption = dom.getElementsByTagName("p")[0];

            return {
              src: img.getAttribute("src"),
              alt: caption.innerText,
            };
          },
        },
      ],
      toDOM: node => {
        return [
          "div",
          {
            class: "image",
          },
          ["img", { ...node.attrs, contentEditable: false }],
          ["p", { class: "caption" }, 0],
        ];
      },
    };
  }

  handleKeyDown = ({ node, getPos }) => event => {
    if (event.key === "Enter") {
      event.preventDefault();

      const { view } = this.editor;
      const pos = getPos() + node.nodeSize;
      view.focus();
      view.dispatch(setTextSelection(pos)(view.state.tr));
      return;
    }
  };

  handleBlur = ({ node, getPos }) => event => {
    const alt = event.target.innerText;
    const src = node.attrs.src;
    if (alt === node.attrs.alt) return;

    const { view } = this.editor;
    const { tr } = view.state;

    // update meta on object
    const pos = getPos();
    const transaction = tr.setNodeMarkup(pos, undefined, {
      src,
      alt,
    });
    view.dispatch(transaction);
  };

  component = options => {
    const { theme } = options;
    const { alt, src } = options.node.attrs;

    return (
      <div className="image" contentEditable={false}>
        <ImageZoom
          image={{
            src,
            alt,
            style: {
              maxWidth: "100%",
              maxHeight: "75vh",
            },
          }}
          defaultStyles={{
            overlay: {
              backgroundColor: theme.background,
            },
          }}
          shouldRespectMaxDimension
        />
        {(options.isEditable || alt) && (
          <Caption
            onKeyDown={this.handleKeyDown(options)}
            onBlur={this.handleBlur(options)}
            tabIndex={-1}
            contentEditable={options.isEditable}
            suppressContentEditableWarning
          >
            {alt}
          </Caption>
        )}
      </div>
    );
  };

  toMarkdown(state, node) {
    state.write(
      "![" +
        state.esc((node.attrs.alt || "").replace("\n", "") || "") +
        "](" +
        state.esc(node.attrs.src) +
        ")"
    );
  }

  parseMarkdown() {
    return {
      node: "image",
      getAttrs: token => ({
        src: token.attrGet("src"),
        alt: (token.children[0] && token.children[0].content) || null,
      }),
    };
  }

  commands({ type }) {
    return attrs => (state, dispatch) => {
      const { selection } = state;
      const position = selection.$cursor
        ? selection.$cursor.pos
        : selection.$to.pos;
      const node = type.create(attrs);
      const transaction = state.tr.insert(position, node);
      dispatch(transaction);
      return true;
    };
  }

  inputRules({ type }) {
    return [
      new InputRule(IMAGE_INPUT_REGEX, (state, match, start, end) => {
        const [okay, alt, src] = match;
        const { tr } = state;

        if (okay) {
          tr.replaceWith(
            start - 1,
            end,
            type.create({
              src,
              alt,
            })
          );
        }

        return tr;
      }),
    ];
  }

  get plugins() {
    return [uploadPlaceholderPlugin, uploadPlugin(this.options)];
  }
}

const Caption = styled.p`
  border: 0;
  display: block;
  font-size: 13px;
  font-style: italic;
  color: ${props => props.theme.textSecondary};
  padding: 2px 0;
  line-height: 16px;
  text-align: center;
  width: 100%;
  min-height: 1em;
  outline: none;
  background: none;
  resize: none;

  &:empty:before {
    color: ${props => props.theme.placeholder};
    content: "Write a caption";
    pointer-events: none;
  }
`;
