import React from "react";
import { findParentNode } from "prosemirror-utils";

import CommonBlockMenu, { Props } from "./CommonBlockMenu";
import BlockMenuItem from "./BlockMenuItem";
import getMenuItems from "../menus/block";

type BlockMenuProps = Omit<Props, "renderMenuItem" | "items"> &
  Required<Pick<Props, "onLinkToolbarOpen" | "embeds">>;

class BlockMenu extends React.Component<BlockMenuProps> {
  get items() {
    return getMenuItems(this.props.dictionary);
  }

  clearSearch = () => {
    const { state, dispatch } = this.props.view;
    const parent = findParentNode(node => !!node)(state.selection);

    if (parent) {
      dispatch(state.tr.insertText("", parent.pos, state.selection.to));
    }
  };

  render() {
    return (
      <CommonBlockMenu
        {...this.props}
        filterable={true}
        onClearSearch={this.clearSearch}
        renderMenuItem={(item, _index, options) => {
          return (
            <BlockMenuItem
              onClick={options.onClick}
              selected={options.selected}
              icon={item.icon}
              title={item.title}
              shortcut={item.shortcut}
            />
          );
        }}
        items={this.items}
      />
    );
  }
}

export default BlockMenu;
