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

  addColumn = ev => {
    ev.preventDefault();
    this.props.editor.insertColumn().blur();
  };

  removeColumn = ev => {
    ev.preventDefault();
    this.props.editor.removeColumn().blur();
  };

  render() {
    const { editor } = this.props;
    const { startBlock, document } = editor.value;
    if (!startBlock) return null;

    const position = editor.getPositionByKey(document, startBlock.key);
    const columnIsSelected =
      position.table.data.get("selectedColumn") !== undefined;
    const rowIsSelected = position.table.data.get("selectedRow") !== undefined;

    return (
      <span>
        {this.renderAlignButton("left", AlignLeftIcon)}
        {this.renderAlignButton("center", AlignCenterIcon)}
        {this.renderAlignButton("right", AlignRightIcon)}
        {(rowIsSelected || columnIsSelected) && <Separator />}
        {rowIsSelected && (
          <React.Fragment>
            <ToolbarButton onMouseDown={this.addRow}>
              <PlusIcon color={this.props.theme.toolbarItem} />
            </ToolbarButton>
            <ToolbarButton onMouseDown={this.removeRow}>
              <TrashIcon color={this.props.theme.toolbarItem} />
            </ToolbarButton>
          </React.Fragment>
        )}
        {columnIsSelected && (
          <React.Fragment>
            <ToolbarButton onMouseDown={this.addColumn}>
              <PlusIcon color={this.props.theme.toolbarItem} />
            </ToolbarButton>
            <ToolbarButton onMouseDown={this.removeColumn}>
              <TrashIcon color={this.props.theme.toolbarItem} />
            </ToolbarButton>
          </React.Fragment>
        )}
      </span>
    );
  }
}

export default withTheme(TableToolbar);
