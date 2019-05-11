// @flow
import * as React from "react";
import { withTheme } from "styled-components";
import { Editor } from "slate-react";
import {
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  InsertLeftIcon,
  InsertRightIcon,
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
      <ToolbarButton
        onMouseDown={onMouseDown}
        active={isActive}
        title={`Align ${align}`}
      >
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

  addColumnRight = ev => {
    ev.preventDefault();
    this.props.editor.insertColumn().blur();
  };

  addColumnLeft = ev => {
    ev.preventDefault();

    const { editor } = this.props;
    const { startBlock, document } = editor.value;
    const position = editor.getPositionByKey(document, startBlock.key);
    editor.insertColumn(position.getColumnIndex()).blur();
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

    return (
      <React.Fragment>
        {this.renderAlignButton("left", AlignLeftIcon)}
        {this.renderAlignButton("center", AlignCenterIcon)}
        {this.renderAlignButton("right", AlignRightIcon)}
        <Separator />
        {columnIsSelected && (
          <React.Fragment>
            <ToolbarButton
              onMouseDown={this.addColumnLeft}
              title="Insert column left"
            >
              <InsertLeftIcon color={this.props.theme.toolbarItem} />
            </ToolbarButton>
            <ToolbarButton
              onMouseDown={this.removeColumn}
              title="Remove column"
            >
              <TrashIcon color={this.props.theme.toolbarItem} />
            </ToolbarButton>
            <ToolbarButton
              onMouseDown={this.addColumnRight}
              title="Insert column right"
            >
              <InsertRightIcon color={this.props.theme.toolbarItem} />
            </ToolbarButton>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

export default withTheme(TableToolbar);
