import { Plugin } from "prosemirror-state";
import Extension from "../lib/Extension";

export default class MarkdownPaste extends Extension {
  get name() {
    return "markdown-paste";
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          handlePaste: (view, event: ClipboardEvent) => {
            if (!view.props.editable) return;

            const text = event.clipboardData.getData("text/plain");
            const html = event.clipboardData.getData("text/html");
            if (text.length === 0 || html) return false;

            event.preventDefault();

            const paste = this.editor.parser.parse(text);
            let slice = paste.slice(0);

            // because the default schema includes a forced level one heading
            // for the title we try and slice the extra node off if we can
            // before adding the parsed nodes to the doc
            try {
              if (!slice.content.firstChild.textContent) {
                slice = slice.removeBetween(0, 2);
              } else {
                slice = slice.removeBetween(5, slice.size);
              }
            } catch (err) {
              console.error(err);
            }

            const transaction = view.state.tr.replaceSelection(slice);
            view.dispatch(transaction);
            return true;
          },
        },
      }),
    ];
  }
}
