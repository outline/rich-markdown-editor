import assert from "assert";
import * as React from "react";
import { EditorView } from "prosemirror-view";
import LinkEditor, { SearchResult } from "./LinkEditor";
import FloatingToolbar from "./FloatingToolbar";

type Props = {
  isActive: boolean;
  view: EditorView;
  tooltip: typeof React.Component;
  onCreateLink?: (title: string) => Promise<string>;
  onSearchLink?: (term: string, setter: Function) => Promise<SearchResult[]>;
  onClickLink: (url: string) => void;
  onShowToast?: (msg: string, code: string) => void;
  onClose: () => void;
  trigger: boolean;
};

function isActive(props) {
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

  render() {
    const { onCreateLink, onClose, ...rest } = this.props;
    const selection = this.props.view.state.selection;

    return (
      <FloatingToolbar
        ref={this.menuRef}
        active={isActive(this.props)}
        {...rest}
      >
        {isActive(this.props) && (
          <LinkEditor
            from={selection.from}
            to={selection.to}
            onCreateLink={onCreateLink ? this.handleOnCreateLink : undefined}
            onSelectLink={this.handleOnSelectLink}
            onRemoveLink={onClose}
            selectedText=""
            {...rest}
          />
        )}
      </FloatingToolbar>
    );
  }
}
