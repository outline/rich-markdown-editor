import refractor from "refractor/core";
import bash from "refractor/lang/bash";
import css from "refractor/lang/css";
import clike from "refractor/lang/clike";
import csharp from "refractor/lang/csharp";
import go from "refractor/lang/go";
import java from "refractor/lang/java";
import javascript from "refractor/lang/javascript";
import json from "refractor/lang/json";
import markup from "refractor/lang/markup";
import php from "refractor/lang/php";
import python from "refractor/lang/python";
import powershell from "refractor/lang/powershell";
import ruby from "refractor/lang/ruby";
import sql from "refractor/lang/sql";
import typescript from "refractor/lang/typescript";
import { setBlockType } from "prosemirror-commands";
import { textblockTypeInputRule } from "prosemirror-inputrules";
import copy from "copy-to-clipboard";
import Prism, { LANGUAGES } from "../plugins/Prism";
import isInCode from "../queries/isInCode";
import Node from "./Node";
import { ToastType } from "../types";

[
  bash,
  css,
  clike,
  csharp,
  go,
  java,
  javascript,
  json,
  markup,
  php,
  python,
  powershell,
  ruby,
  sql,
  typescript,
].forEach(refractor.register);

export default class CodeFence extends Node {
  get languageOptions() {
    return Object.entries(LANGUAGES);
  }

  get name() {
    return "code_fence";
  }

  get schema() {
    return {
      attrs: {
        language: {
          default: "javascript",
        },
      },
      content: "text*",
      marks: "",
      group: "block",
      code: true,
      defining: true,
      draggable: false,
      parseDOM: [
        { tag: "pre", preserveWhitespace: "full" },
        {
          tag: ".code-block",
          preserveWhitespace: "full",
          contentElement: "code",
          getAttrs: (dom: HTMLDivElement) => {
            return {
              language: dom.dataset.language,
            };
          },
        },
      ],
      toDOM: node => {
        const button = document.createElement("button");
        button.innerText = "Copy";
        button.type = "button";
        button.addEventListener("click", this.handleCopyToClipboard(node));

        const select = document.createElement("select");
        select.addEventListener("change", this.handleLanguageChange);

        this.languageOptions.forEach(([key, label]) => {
          const option = document.createElement("option");
          const value = key === "none" ? "" : key;
          option.value = value;
          option.innerText = label;
          option.selected = node.attrs.language === value;
          select.appendChild(option);
        });

        return [
          "div",
          { class: "code-block", "data-language": node.attrs.language },
          ["div", { contentEditable: false }, select, button],
          ["pre", ["code", { spellCheck: false }, 0]],
        ];
      },
    };
  }

  commands({ type }) {
    return () => setBlockType(type);
  }

  keys({ type }) {
    return {
      "Shift-Ctrl-\\": setBlockType(type),
      "Shift-Enter": (state, dispatch) => {
        if (!isInCode(state)) return false;

        const { tr, selection } = state;
        dispatch(tr.insertText("\n", selection.from, selection.to));
        return true;
      },
      Tab: (state, dispatch) => {
        if (!isInCode(state)) return false;

        const { tr, selection } = state;
        dispatch(tr.insertText("  ", selection.from, selection.to));
        return true;
      },
    };
  }

  handleCopyToClipboard(node) {
    return () => {
      copy(node.textContent);
      if (this.options.onShowToast) {
        this.options.onShowToast(
          this.options.dictionary.codeCopied,
          ToastType.Info
        );
      }
    };
  }

  handleLanguageChange = event => {
    const { view } = this.editor;
    const { tr } = view.state;
    const element = event.target;
    const { top, left } = element.getBoundingClientRect();
    const result = view.posAtCoords({ top, left });

    if (result) {
      const transaction = tr.setNodeMarkup(result.inside, undefined, {
        language: element.value,
      });
      view.dispatch(transaction);
    }
  };

  get plugins() {
    return [
      Prism({
        name: this.name,
        deferred: !this.options.initialReadOnly,
      }),
    ];
  }

  inputRules({ type }) {
    return [textblockTypeInputRule(/^```$/, type)];
  }

  toMarkdown(state, node) {
    state.write("```" + (node.attrs.language || "") + "\n");
    state.text(node.textContent, false);
    state.ensureNewLine();
    state.write("```");
    state.closeBlock(node);
  }

  get markdownToken() {
    return "fence";
  }

  parseMarkdown() {
    return {
      block: "code_block",
      getAttrs: tok => ({ language: tok.info }),
    };
  }
}
