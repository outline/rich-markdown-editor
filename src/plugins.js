// @flow
import { Node, Editor } from "slate";
import TrailingBlock from "@wikifactory/slate-trailing-block";
import EditCode from "@wikifactory/slate-edit-code";
import EditBlockquote from "@wikifactory/slate-edit-blockquote";
import InsertImages from "slate-drop-or-paste-images";
import PasteLinkify from "slate-paste-linkify";
import CollapseOnEscape from "slate-collapse-on-escape";
import Prism from "golery-slate-prism";
import Placeholder from "./plugins/Placeholder";
import EditList from "./plugins/EditList";
import CollapsableHeadings from "./plugins/CollapsableHeadings";
import KeyboardBehavior from "./plugins/KeyboardBehavior";
import KeyboardShortcuts from "./plugins/KeyboardShortcuts";
import MarkdownShortcuts from "./plugins/MarkdownShortcuts";
import MarkdownPaste from "./plugins/MarkdownPaste";
import Ellipsis from "./plugins/Ellipsis";
import Embeds from "./plugins/Embeds";
import Nodes from "./nodes.js";

// additional language support based on the most popular programming languages
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-php";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";

const createPlugins = ({ placeholder, getLinkComponent }: *) => {
  return [
    Nodes,
    PasteLinkify({
      type: "link",
      collapseTo: "end",
    }),
    Placeholder({
      placeholder,
      when: (editor: Editor, node: Node) => {
        if (editor.readOnly) return false;
        if (node.object !== "block") return false;
        if (node.type !== "paragraph") return false;
        if (node.text !== "") return false;
        if (editor.value.document.getBlocks().size > 1) return false;
        return true;
      },
    }),
    InsertImages({
      extensions: ["png", "jpg", "gif", "webp"],
      insertImage: (editor, file) => editor.insertImageFile(file),
    }),
    EditCode({
      containerType: "code",
      lineType: "code-line",
      exitBlocktype: "paragraph",
      allowMarks: false,
      selectAll: true,
    }),
    EditBlockquote({
      type: "block-quote",
      typeDefault: "paragraph",
    }),
    Prism({
      onlyIn: node => node.type === "code",
      getSyntax: node => node.data.get("language") || "javascript",
    }),
    Embeds({ getComponent: getLinkComponent }),
    CollapseOnEscape({ toEdge: "end" }),
    CollapsableHeadings(),
    KeyboardBehavior(),
    KeyboardShortcuts(),
    MarkdownShortcuts(),
    MarkdownPaste(),
    EditList,
    Ellipsis(),
    TrailingBlock({ type: "paragraph" }),
  ];
};

export default createPlugins;
