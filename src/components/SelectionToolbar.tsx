import assert from "assert";
import * as React from "react";
import { Portal } from "react-portal";
import { some } from "lodash";
import { EditorView } from "prosemirror-view";
import getTableColMenuItems from "../menus/tableCol";
import getTableRowMenuItems from "../menus/tableRow";
import getTableMenuItems from "../menus/table";
import getFormattingMenuItems from "../menus/formatting";
import getImageMenuItems from "../menus/image";
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

export const getText = content => {
  if (!content) {
    return "";
  } else if (content.text) {
    return content.text;
  } else if (Array.isArray(content)) {
    return content.map(getText).join("");
  } else if (typeof content === "object" && content !== null) {
    return getText(content.content);
  }
};

export const iOS = () => {
  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
};

export const android = () => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf("android") > -1;
};

type Props = {
  dictionary: typeof baseDictionary;
  tooltip: typeof React.Component | React.FC<any>;
  isTemplate: boolean;
  commands: Record<string, any>;
  onSearchLink?: (term: string, setter: (resultObj: object) => void) => void;
  onClickLink: (href: string, event: MouseEvent) => void;
  onCreateLink?: (title: string) => Promise<string>;
  onTurnIntoCards?: (href: string) => Promise<string>;
  onShowToast?: (msg: string, code: string) => void;
  view: EditorView;
  floating?: boolean;
  linkIsActive?: boolean;
  onClose?: () => void;
  searchTriggerOpen?: boolean;
  resetSearchTrigger?: () => void;
  Avatar: typeof React.Component | React.FC<any>;
  onCreateFlashcard?: (txt?: string, surroundTxt?: string) => void;
  onMoveLink?: (title: string) => Promise<string>;
};

function isActive(props) {
  const { view } = props;
  const { selection } = view.state;

  if (!selection) return false;
  if (selection.empty) return false;
  if (selection.node && selection.node.type.name === "image") {
    return true;
  }
  if (selection.node) return false;

  const slice = selection.content();
  const fragment = slice.content;
  const nodes = fragment.content;

  return some(nodes, n => n.content.size);
}

export default class SelectionToolbar extends React.Component<Props> {
  handleOnCreateLink = async (title: string, turnInto = false) => {
    const {
      dictionary,
      onCreateLink,
      onTurnIntoCards,
      view,
      onShowToast,
    } = this.props;
    if (this.props.onClose) {
      this.props.onClose();
      this.props.view.focus();
    }

    if (!onCreateLink) {
      return;
    }

    const { dispatch, state } = view;
    let { from, to } = state.selection;

    const href = `creating#${title}…`;
    const markType = state.schema.marks.link;

    if (from === to) {
      if (this.props.searchTriggerOpen) {
        this.props.resetSearchTrigger && this.props.resetSearchTrigger();
        dispatch(view.state.tr.delete(from - 2, from));
        from = from - 2;
        to = to - 2;
      }
      // Insert a placeholder link
      dispatch(
        view.state.tr
          .insertText(title, from, to)
          .addMark(from, to + title.length, markType.create({ href }))
      );
    } else {
      // Insert a placeholder link
      dispatch(
        view.state.tr
          .removeMark(from, to, markType)
          .addMark(from, to, markType.create({ href }))
      );
    }

    createAndInsertLink(view, title, href, {
      onCreateLink:
        turnInto && onTurnIntoCards ? onTurnIntoCards : onCreateLink,
      onShowToast,
      dictionary,
    });
  };

  handleOnSelectLink = ({
    href,
    from,
    to,
    title,
  }: {
    href: string;
    from: number;
    to: number;
    title: string;
  }): void => {
    const { view } = this.props;
    const { state, dispatch } = view;
    if (this.props.onClose) {
      this.props.onClose();
      this.props.view.focus();
    }
    const markType = state.schema.marks.link;

    if (from === to) {
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
    } else {
      dispatch(
        state.tr
          .removeMark(from, to, markType)
          .addMark(from, to, markType.create({ href }))
      );
    }
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
    // on iOS, native editor conflicts with link search menu and inline edit bar
    // we do need to keep link editing bar however
    // if (!link && (iOS() || android())) {
    //   return null;
    // }
    const range = getMarkRange(selection.$from, state.schema.marks.link);
    const isImageSelection =
      selection.node && selection.node.type.name === "image";

    const selectedText = getText(selection.content());

    let items: MenuItem[] = [];
    if (isTableSelection) {
      items = getTableMenuItems(dictionary);
    } else if (colIndex !== undefined) {
      items = getTableColMenuItems(state, colIndex, dictionary);
    } else if (rowIndex !== undefined) {
      items = getTableRowMenuItems(state, rowIndex, dictionary);
    } else if (isImageSelection) {
      items = getImageMenuItems(state, dictionary);
    } else {
      items = getFormattingMenuItems(state, isTemplate, dictionary);
    }

    if (!items.length) {
      return null;
    }

    const MenuEl = <Menu items={items} {...rest} />;
    const LinkEditorEl = (
      <LinkEditor
        onCreateFlashcard={this.props.onCreateFlashcard}
        dictionary={dictionary}
        mark={(range && range.mark) || undefined}
        from={(range && range.from) || selection.from}
        to={(range && range.to) || selection.to}
        onCreateLink={onCreateLink ? this.handleOnCreateLink : undefined}
        onMoveLink={this.props.onMoveLink}
        Avatar={this.props.Avatar}
        onSelectLink={this.handleOnSelectLink}
        selectedText={selectedText}
        onRemoveLink={this.props.onClose}
        {...rest}
      />
    );

    return this.props.floating ? (
      <Portal>
        <FloatingToolbar view={view} active={isActive(this.props)}>
          {link && range ? LinkEditorEl : MenuEl}
        </FloatingToolbar>
      </Portal>
    ) : (
      <BottomToolbarWrapper>
        <div style={{ padding: "10px" }}>
          {((link && range) || this.props.linkIsActive) && LinkEditorEl}
        </div>
        {MenuEl}
      </BottomToolbarWrapper>
    );
  }
}

export const BottomToolbarWrapper = ({ children }) => {
  return (
    <div
      style={{
        width: "100%",
        background: "#fff",
        position: "sticky",
        // prevent gap on chrome
        bottom: "-2px",
      }}
    >
      {children}
    </div>
  );
};
