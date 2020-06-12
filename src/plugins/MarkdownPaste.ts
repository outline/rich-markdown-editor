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
            if (view.props.editable && !view.props.editable(view.state)) {
              return false;
            }
            if (!event.clipboardData) return false;

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
              const { embeds } = this.editor.props;

              if (embeds) {
                for (const embed of embeds) {
                  const matches = embed.matcher(text);
                  if (matches) {
                    this.editor.commands.embed({
                      href: text,
                      component: embed.component,
                      matches,
                    });
                    return true;
                  }
                }
              }
            }

            // otherwise, if we have html then fallback to the default HTML
            // parser behavior that comes with Prosemirror.
            if (text.length === 0 || html) return false;

            event.preventDefault();

            const paste = this.editor.parser.parse(text);
            const slice = paste.slice(0);

            const transaction = view.state.tr.replaceSelection(slice);
            view.dispatch(transaction);
            return true;
          },
        },
      }),
    ];
  }
}
