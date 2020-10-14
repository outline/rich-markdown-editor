import assert from "assert";
import * as React from "react";
import { Portal } from "react-portal";
import { some } from "lodash";
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
import baseDictionary from "../dictionary";

type Props = {
  dictionary: typeof baseDictionary;
  tooltip: typeof React.Component | React.FC<any>;
  isTemplate: boolean;
  commands: Record<string, any>;
  onSearchLink?: (term: string) => Promise<SearchResult[]>;
  onClickLink: (href: string, event: MouseEvent) => void;
  onCreateLink?: (title: string) => Promise<string>;
  onShowToast?: (msg: string, code: string) => void;
  view: EditorView;
  disabledItems?: Array<string>;
};

function isActive(props) {
  const { view } = props;
  const { selection } = view.state;

  if (!selection) return false;
  if (selection.empty) return false;
  if (selection.node) return false;

  const slice = selection.content();
  const fragment = slice.content;
  const nodes = fragment.content;

  return some(nodes, n => n.content.size);
}

export default class SelectionToolbar extends React.Component<Props> {
  handleOnCreateLink = async (title: string) => {
    const { dictionary, onCreateLink, view, onShowToast } = this.props;

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
      dictionary,
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
    const { dictionary, onCreateLink, isTemplate, ...rest } = this.props;
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
      items = getTableMenuItems(dictionary);
    } else if (colIndex !== undefined) {
      items = getTableColMenuItems(state, colIndex, dictionary);
    } else if (rowIndex !== undefined) {
      items = getTableRowMenuItems(state, rowIndex, dictionary);
    } else {
      items = getFormattingMenuItems(state, isTemplate, dictionary);
    }

    const filtered = items.filter(item => {
      // If this is on the disabled list, hide
      if (this.props.disabledItems?.includes(item.name as string)) return false;
      return true;
    })
    const reduced = filtered.reduce((acc, item, index) => {
      // trim separators from start / end
      if (item.name === "separator" && index === 0) return acc;
      if (item.name === "separator" && index === filtered.length - 1)
        return acc;
      return [...acc, item];
    }, []);
  
    if (!reduced.length) {
      return null;
    }

    return (
      <Portal>
        <FloatingToolbar view={view} active={isActive(this.props)}>
          {link && range ? (
            <LinkEditor
              dictionary={dictionary}
              mark={range.mark}
              from={range.from}
              to={range.to}
              onCreateLink={onCreateLink ? this.handleOnCreateLink : undefined}
              onSelectLink={this.handleOnSelectLink}
              {...rest}
            />
          ) : (
            <Menu items={reduced} {...rest} />
          )}
        </FloatingToolbar>
      </Portal>
    );
  }
}
