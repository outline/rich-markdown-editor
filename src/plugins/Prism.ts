import refractor from "refractor/core";
import { flattenDeep } from "lodash";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { findBlockNodes } from "prosemirror-utils";

function getDecorations({ doc, name }) {
  const decorations = [];
  const blocks = findBlockNodes(doc).filter(
    item => item.node.type.name === name
  );

  function parseNodes(
    nodes,
    className = []
  ): { text: string; classes: string[] }[] {
    return nodes.map(node => {
      const classes = [
        ...className,
        ...(node.properties ? node.properties.className : []),
      ];

      if (node.children) {
        return parseNodes(node.children, classes);
      }

      return {
        text: node.value,
        classes,
      };
    });
  }

  blocks.forEach(block => {
    let startPos = block.pos + 1;
    const language = block.node.attrs.language;
    if (!language || language === "none") return;

    const nodes = refractor.highlight(block.node.textContent, language);

    flattenDeep(parseNodes(nodes))
      .map(node => {
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

export default function Prism({ name, deferred = true }) {
  return new Plugin({
    key: new PluginKey("prism"),
    state: {
      init: (_, { doc }) => {
        if (deferred) return;

        return getDecorations({ doc, name });
      },
      apply: (transaction, decorationSet, oldState, state) => {
        // TODO: find way to cache decorations
        // see: https://discuss.prosemirror.net/t/how-to-update-multiple-inline-decorations-on-node-change/1493

        const deferredInit = !decorationSet;
        const nodeName = state.selection.$head.parent.type.name;
        const previousNodeName = oldState.selection.$head.parent.type.name;
        const codeBlockChanged =
          transaction.docChanged && [nodeName, previousNodeName].includes(name);

        if (deferredInit || codeBlockChanged) {
          return getDecorations({ doc: transaction.doc, name });
        }

        return decorationSet.map(transaction.mapping, transaction.doc);
      },
    },
    props: {
      decorations(state) {
        return this.getState(state);
      },
    },
  });
}
