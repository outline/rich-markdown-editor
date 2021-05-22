import { Plugin } from "prosemirror-state";
import { isInTable } from "prosemirror-tables";
import { toggleMark } from "prosemirror-commands";
import Extension from "../lib/Extension";
import isUrl from "../lib/isUrl";
import isInCode from "../queries/isInCode";

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

            // first check if the clipboard contents can be parsed as a single
            // url, this is mainly for allowing pasted urls to become embeds
            if (isUrl(text)) {
              // just paste the link mark directly onto the selected text
              if (!state.selection.empty) {
                toggleMark(this.editor.schema.marks.link, { href: text })(
                  state,
                  dispatch
                );
                return true;
              }

              // Is this link embeddable? Create an embed!
              const { embeds } = this.editor.props;

              if (embeds && !isInTable(state)) {
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

              // well, it's not an embed and there is no text selected – so just
              // go ahead and insert the link directly
              const transaction = view.state.tr
                .insertText(text, state.selection.from, state.selection.to)
                .addMark(
                  state.selection.from,
                  state.selection.to + text.length,
                  state.schema.marks.link.create({ href: text })
                );
              view.dispatch(transaction);
              return true;
            }

            // otherwise, if we have html on the clipboard that looks like it
            // came from Prosemirror then use the default HTML parser behavior
            if (text.length === 0 || (html && html.includes("data-pm-slice"))) {
              return false;
            }

            event.preventDefault();

            // If the users selection is currently in a code block then paste
            // as plain text, ignore all formatting.
            if (isInCode(view.state)) {
              view.dispatch(view.state.tr.insertText(text));
              return true;
            }

            // If we've gotten this far then treat the plain text content of the
            // clipboard as possible markdown and use the parser
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
