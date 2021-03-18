import refractor from "refractor/core";
import flattenDeep from "lodash/flattenDeep";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { findBlockNodes } from "prosemirror-utils";

export const LANGUAGES = {
  none: "None", // additional entry to disable highlighting
  bash: "Bash",
  css: "CSS",
  clike: "C",
  csharp: "C#",
  go: "Go",
  markup: "HTML",
  java: "Java",
  javascript: "JavaScript",
  json: "JSON",
  php: "PHP",
  powershell: "Powershell",
  python: "Python",
  ruby: "Ruby",
  sql: "SQL",
  typescript: "TypeScript",
};

type ParsedNode = {
  text: string;
  classes: string[];
};

function getDecorations({ doc, name }) {
  const decorations: Decoration[] = [];
  const blocks = findBlockNodes(doc).filter(
    item => item.node.type.name === name
  );

  function parseNodes(
    nodes: refractor.RefractorNode[],
    classNames: string[] = []
  ): any {
    return nodes.map(node => {
      if (node.type === "element") {
        const classes = [...classNames, ...(node.properties.className || [])];
        return parseNodes(node.children, classes);
      }

      return {
        text: node.value,
        classes: classNames,
      };
    });
  }

  blocks.forEach(block => {
    let startPos = block.pos + 1;
    const language = block.node.attrs.language;
    if (!language || language === "none" || !refractor.registered(language)) {
      return;
    }

    const nodes = refractor.highlight(block.node.textContent, language);

    flattenDeep(parseNodes(nodes))
      .map((node: ParsedNode) => {
        const from = startPos;
        const to = from + node.text.length;

        startPos = to;

        return {
          ...node,
          from,
          to,
        };
      })
      .forEach(node => {
        const decoration = Decoration.inline(node.from, node.to, {
          class: (node.classes || []).join(" "),
        });
        decorations.push(decoration);
      });
  });

  return DecorationSet.create(doc, decorations);
}

export default function Prism({ name }) {
  let highlighted = false;

  return new Plugin({
    key: new PluginKey("prism"),
    state: {
      init: (_: Plugin, { doc }) => {
        return DecorationSet.create(doc, []);
      },
      apply: (transaction, decorationSet, oldState, state) => {
        // TODO: find way to cache decorations
        // see: https://discuss.prosemirror.net/t/how-to-update-multiple-inline-decorations-on-node-change/1493

        const nodeName = state.selection.$head.parent.type.name;
        const previousNodeName = oldState.selection.$head.parent.type.name;
        const codeBlockChanged =
          transaction.docChanged && [nodeName, previousNodeName].includes(name);

        if (!highlighted || codeBlockChanged) {
          highlighted = true;
          return getDecorations({ doc: transaction.doc, name });
        }

        return decorationSet.map(transaction.mapping, transaction.doc);
      },
    },
    view: view => {
      if (!highlighted) {
        // we don't highlight code blocks on the first render as part of mounting
        // as it's expensive (relative to the rest of the document). Instead let
        // it render un-highlighted and then trigger a defered render of Prism
        // by updating the plugins metadata
        setTimeout(() => {
          view.dispatch(view.state.tr.setMeta("prism", { loaded: true }));
        }, 10);
      }
      return {};
    },
    props: {
      decorations(state) {
        return this.getState(state);
      },
    },
  });
}
