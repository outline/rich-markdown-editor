import assert from "assert";
import * as React from "react";
import { Portal } from "react-portal";
import { EditorView } from "prosemirror-view";
import getTableColMenuItems from "../menus/tableCol";
import getTableRowMenuItems from "../menus/tableRow";
import getTableMenuItems from "../menus/table";
import getFormattingMenuItems from "../menus/formatting";
import FloatingToolbar from "./FloatingToolbar";
import LinkEditor, { SearchResult } from "./LinkEditor";
import Menu from "./Menu";
import isMarkActive from "../queries/isMarkActive";
import getMarkRange from "../queries/getMarkRange";
import isNodeActive from "../queries/isNodeActive";
import getColumnIndex from "../queries/getColumnIndex";
import getRowIndex from "../queries/getRowIndex";
import createAndInsertLink from "../commands/createAndInsertLink";
import { MenuItem } from "../types";

type Props = {
  tooltip: typeof React.Component;
  commands: Record<string, any>;
  onSearchLink?: (term: string) => Promise<SearchResult[]>;
  onClickLink: (url: string) => void;
  onCreateLink?: (title: string) => Promise<string>;
  onShowToast?: (msg: string, code: string) => void;
  view: EditorView;
};

function isActive(props) {
  const { view } = props;
  const { selection } = view.state;

  return selection && !selection.empty && !selection.node;
}

export default class SelectionToolbar extends React.Component<Props> {
  handleOnCreateLink = async (title: string) => {
    const { onCreateLink, view, onShowToast } = this.props;

    if (!onCreateLink) {
      return;
    }

    const { dispatch, state } = view;
    const { from, to } = state.selection;
    assert(from !== to);

    const href = `creating#${title}…`;
    const markType = state.schema.marks.link;

    // Insert a placeholder link
    dispatch(
      view.state.tr
        .removeMark(from, to, markType)
        .addMark(from, to, markType.create({ href }))
    );

    createAndInsertLink(view, title, href, {
      onCreateLink,
      onShowToast,
    });
  };

  handleOnSelectLink = ({
    href,
    from,
    to,
  }: {
    href: string;
    from: number;
    to: number;
  }): void => {
    const { view } = this.props;
    const { state, dispatch } = view;

    const markType = state.schema.marks.link;

    dispatch(
      state.tr
        .removeMark(from, to, markType)
        .addMark(from, to, markType.create({ href }))
    );
  };

  render() {
    const { onCreateLink, ...rest } = this.props;
    const { view } = rest;
    const { state } = view;
    const { selection }: { selection: any } = state;
    const isCodeSelection = isNodeActive(state.schema.nodes.code_block)(state);

    // toolbar is disabled in code blocks, no bold / italic etc
    if (isCodeSelection) {
      return null;
    }

    const colIndex = getColumnIndex(state.selection);
    const rowIndex = getRowIndex(state.selection);
    const isTableSelection = colIndex !== undefined && rowIndex !== undefined;
    const link = isMarkActive(state.schema.marks.link)(state);
    const range = getMarkRange(selection.$from, state.schema.marks.link);

    let items: MenuItem[] = [];
    if (isTableSelection) {
      items = getTableMenuItems();
    } else if (colIndex !== undefined) {
      items = getTableColMenuItems(state, colIndex);
    } else if (rowIndex !== undefined) {
      items = getTableRowMenuItems(state, rowIndex);
    } else {
      items = getFormattingMenuItems(state);
    }

    if (!items.length) {
      return null;
    }

    return (
      <Portal>
        <FloatingToolbar view={view} active={isActive(this.props)}>
          {link && range ? (
            <LinkEditor
              mark={range.mark}
              from={range.from}
              to={range.to}
              onCreateLink={onCreateLink ? this.handleOnCreateLink : undefined}
              onSelectLink={this.handleOnSelectLink}
              {...rest}
            />
          ) : (
            <Menu items={items} {...rest} />
          )}
        </FloatingToolbar>
      </Portal>
    );
  }
}
