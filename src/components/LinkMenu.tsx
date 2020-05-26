import * as React from "react";
import { EditorView } from "prosemirror-view";
import LinkEditor, { SearchResult } from "./LinkEditor";
import SelectionToolbar from "./SelectionToolbar";

type Props = {
  isActive: boolean;
  // commands: Record<string, any>;
  view: EditorView;
  tooltip: typeof React.Component;
  onCreateLink?: (title: string) => Promise<string>;
  onSearchLink?: (term: string) => Promise<SearchResult[]>;
  onClickLink: (url: string) => void;
  onClose: () => void;
};

export default class LinkMenu extends React.Component<Props> {
  menuRef = React.createRef<HTMLDivElement>();

  state = {
    left: -1000,
    top: undefined,
  };

  handleOnCreateLink = async (title: string) => {
    if (!this.props.onCreateLink) {
      return "";
    }

    this.props.onClose();

    // insert text node
    const { dispatch, state } = this.props.view;
    dispatch(
      state.tr
        .insertText(title, state.selection.from, state.selection.to)
        .addMark(
          state.selection.from,
          state.selection.to + title.length,
          state.schema.marks.link.create({ href: "#loading…" })
        )
    );
    this.props.view.focus();

    // const url = await this.props.onCreateLink(title);
  };

  render() {
    const { onCreateLink, onClose, ...rest } = this.props;
    const selection = this.props.view.state.selection;

    console.log(this.state);

    return (
      <SelectionToolbar {...rest}>
        <LinkEditor
          from={selection.from}
          to={selection.to}
          onCreateLink={onCreateLink ? this.handleOnCreateLink : undefined}
          onRemoveLink={onClose}
          {...rest}
        />
      </SelectionToolbar>
    );
  }
}
