import assert from "assert";
import * as React from "react";
import { EditorView } from "prosemirror-view";
import LinkEditor, { SearchResult } from "./LinkEditor";
import FloatingToolbar from "./FloatingToolbar";
import createAndInsertLink from "../commands/createAndInsertLink";
import baseDictionary from "../dictionary";

type Props = {
  isActive: boolean;
  view: EditorView;
  tooltip: typeof React.Component | React.FC<any>;
  dictionary: typeof baseDictionary;
  onCreateLink?: (title: string) => Promise<string>;
  onTurnIntoCards?: (href: string) => Promise<string>;
  onSearchLink?: (term: string, setter: (resultObj: object) => void) => void;
  onClickLink: (href: string, event: MouseEvent) => void;
  onShowToast?: (msg: string, code: string) => void;
  onClose: () => void;
  searchTriggerOpen?: boolean;
  resetSearchTrigger?: () => void;
  Avatar: typeof React.Component | React.FC<any>;
  onCreateFlashcard?: (txt?: string, surroundTxt?: string) => void;
  onMoveLink?: (title: string) => Promise<string>;
};

export function isActive(props) {
  const { view } = props;
  const { selection } = view.state;

  const paragraph = view.domAtPos(selection.$from.pos);
  return props.isActive && !!paragraph.node;
}

export default class LinkToolbar extends React.Component<Props> {
  menuRef = React.createRef<HTMLDivElement>();

  state = {
    left: -1000,
    top: undefined,
  };

  componentDidMount() {
    window.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    window.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleClickOutside = ev => {
    if (
      ev.target &&
      this.menuRef.current &&
      this.menuRef.current.contains(ev.target)
    ) {
      return;
    }

    this.props.onClose();
  };

  handleOnCreateLink = async (title: string, turnInto = false) => {
    const {
      dictionary,
      onCreateLink,
      onTurnIntoCards,
      view,
      onClose,
      onShowToast,
    } = this.props;

    onClose();
    this.props.view.focus();

    if (!onCreateLink) {
      return;
    }

    const { dispatch, state } = view;
    let { from, to } = state.selection;
    assert(from === to);
    if (this.props.searchTriggerOpen) {
      this.props.resetSearchTrigger && this.props.resetSearchTrigger();
      dispatch(view.state.tr.delete(from - 2, from));
      from = from - 2;
      to = to - 2;
    }

    const href = `creating#${title}…`;

    // Insert a placeholder link
    dispatch(
      view.state.tr
        .insertText(title, from, to)
        .addMark(
          from,
          to + title.length,
          state.schema.marks.link.create({ href })
        )
    );

    createAndInsertLink(view, title, href, {
      onCreateLink:
        turnInto && onTurnIntoCards ? onTurnIntoCards : onCreateLink,
      onShowToast,
      dictionary,
    });
  };

  handleOnSelectLink = ({
    href,
    title,
  }: {
    href: string;
    title: string;
    from: number;
    to: number;
  }) => {
    const { view, onClose } = this.props;

    onClose();
    this.props.view.focus();

    const { dispatch, state } = view;
    let { from, to } = state.selection;
    assert(from === to);
    if (this.props.searchTriggerOpen) {
      this.props.resetSearchTrigger && this.props.resetSearchTrigger();
      dispatch(view.state.tr.delete(from - 2, from));
      from = from - 2;
      to = to - 2;
    }

    dispatch(
      view.state.tr
        .insertText(title, from, to)
        .addMark(
          from,
          to + title.length,
          state.schema.marks.link.create({ href })
        )
    );
  };

  render() {
    const { onCreateLink, onTurnIntoCards, onClose, ...rest } = this.props;
    const selection = this.props.view.state.selection;

    return (
      <FloatingToolbar
        ref={this.menuRef}
        active={isActive(this.props)}
        {...rest}
      >
        {isActive(this.props) && (
          <LinkEditor
            onCreateFlashcard={this.props.onCreateFlashcard}
            from={selection.from}
            to={selection.to}
            onCreateLink={onCreateLink ? this.handleOnCreateLink : undefined}
            onMoveLink={this.props.onMoveLink}
            Avatar={this.props.Avatar}
            onSelectLink={this.handleOnSelectLink}
            onRemoveLink={onClose}
            {...rest}
          />
        )}
      </FloatingToolbar>
    );
  }
}
