import { Plugin } from "prosemirror-state";
import { toggleMark } from "prosemirror-commands";
import Extension from "../lib/Extension";
import isUrl from "../lib/isUrl";

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
            const { state, dispatch } = view;

            // first check if the clipboard contents can be parsed as a url
            if (isUrl(text)) {
              // just paste the link mark directly onto the selected text
              if (!state.selection.empty) {
                toggleMark(this.editor.schema.marks.link, { href: text })(
                  state,
                  dispatch
                );
                return true;
              }

              // Is this link embedable? Create an embed!
              const component = this.editor.props.getLinkComponent(text);
              if (component) {
                this.editor.commands.embed({
                  href: text,
                  component,
                });
                return true;
              }
            }

            // otherwise, if we have html then fallback to the default HTML
            // parser behavior that comes with Prosemirror.
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
