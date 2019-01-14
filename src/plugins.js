// @flow
import TrailingBlock from "@wikifactory/slate-trailing-block";
import EditCode from "@wikifactory/slate-edit-code";
import EditBlockquote from "@wikifactory/slate-edit-blockquote";
import InsertImages from "slate-drop-or-paste-images";
import PasteLinkify from "slate-paste-linkify";
import CollapseOnEscape from "slate-collapse-on-escape";
import Prism from "golery-slate-prism";
import EditList from "./plugins/EditList";
import KeyboardShortcuts from "./plugins/KeyboardShortcuts";
import MarkdownShortcuts from "./plugins/MarkdownShortcuts";
import MarkdownPaste from "./plugins/MarkdownPaste";
import Ellipsis from "./plugins/Ellipsis";
import Embeds from "./plugins/Embeds";
import { insertImageFile } from "./changes";

// additional language support based on the most popular programming languages
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-php";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";

const createPlugins = ({ getLinkComponent }: *) => {
  return [
    PasteLinkify({
      type: "link",
      collapseTo: "end",
    }),
    InsertImages({
      extensions: ["png", "jpg", "gif", "webp"],
      insertImage: async (editor, file) => {
        return editor.call(insertImageFile, file);
      },
    }),
    EditList,
    EditCode({
      containerType: "code",
      lineType: "code-line",
      exitBlocktype: "paragraph",
      allowMarks: false,
      selectAll: true,
    }),
    EditBlockquote(),
    Prism({
      onlyIn: node => node.type === "code",
      getSyntax: node => node.data.get("language") || "javascript",
    }),
    CollapseOnEscape({ toEdge: "end" }),
    KeyboardShortcuts(),
    MarkdownShortcuts(),
    MarkdownPaste(),
    Ellipsis(),
    TrailingBlock({ type: "paragraph" }),
    Embeds({ getComponent: getLinkComponent }),
  ];
};

export default createPlugins;
