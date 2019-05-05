// @flow
import * as React from "react";
import { withTheme } from "styled-components";
import { Editor } from "slate-react";
import {
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  PlusIcon,
  TrashIcon,
} from "outline-icons";

import type { Theme } from "../../types";
import ToolbarButton from "./ToolbarButton";
import Separator from "./Separator";

type Props = {
  editor: Editor,
  theme: Theme,
};

class TableToolbar extends React.Component<Props> {
  /**
   * Check if the current selection has a mark with `type` in it.
   *
   * @param {String} type
   * @return {Boolean}
   */
  hasAlign = (align: string) => {
    try {
      const { editor } = this.props;
      const { startBlock, document } = editor.value;

      const position = editor.getPositionByKey(document, startBlock.key);
      return (
        position.node.data.get("align") === align ||
        startBlock.data.get("align") === align
      );
    } catch (_err) {
      return false;
    }
  };

  onClickAlign = (ev, align) => {
    ev.preventDefault();

    const { editor } = this.props;
    const { startBlock, document } = editor.value;
    const position = editor.getPositionByKey(document, startBlock.key);
    editor.moveSelection(position.getColumnIndex(), position.getRowIndex());
    editor.setColumnAlign(align);
  };

  renderAlignButton = (align: string, IconClass: Function) => {
    const isActive = this.hasAlign(align);
    const onMouseDown = ev => this.onClickAlign(ev, align);

    return (
      <ToolbarButton onMouseDown={onMouseDown} active={isActive}>
        <IconClass color={this.props.theme.toolbarItem} />
      </ToolbarButton>
    );
  };

  addRow = ev => {
    ev.preventDefault();
    this.props.editor.insertRow().blur();
  };

  removeRow = ev => {
    ev.preventDefault();
    this.props.editor.removeRow().blur();
  };

  render() {
    return (
      <span>
        {this.renderAlignButton("left", AlignLeftIcon)}
        {this.renderAlignButton("center", AlignCenterIcon)}
        {this.renderAlignButton("right", AlignRightIcon)}
        <Separator />
        <ToolbarButton onMouseDown={this.addRow}>
          <PlusIcon color={this.props.theme.toolbarItem} />
        </ToolbarButton>
        <ToolbarButton onMouseDown={this.removeRow}>
          <TrashIcon color={this.props.theme.toolbarItem} />
        </ToolbarButton>
      </span>
    );
  }
}

export default withTheme(TableToolbar);
