// @flow
import * as React from "react";
import { withTheme } from "styled-components";
import { Editor } from "slate-react";
import { BulletedListIcon } from "outline-icons";

import type { Theme } from "../../types";
import ToolbarButton from "./ToolbarButton";

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
  hasAlign = (type: string) => {
    try {
      return this.props.editor.value.nodes.some(
        node => node.data.get("align") === type
      );
    } catch (_err) {
      return false;
    }
  };

  isBlock = (type: string) => {
    const startBlock = this.props.editor.value.startBlock;
    return startBlock && startBlock.type === type;
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

  render() {
    return (
      <span>
        {this.renderAlignButton("left", BulletedListIcon)}
        {this.renderAlignButton("center", BulletedListIcon)}
        {this.renderAlignButton("right", BulletedListIcon)}
      </span>
    );
  }
}

export default withTheme(TableToolbar);
