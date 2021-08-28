import React from "react";
import { gemoji as gemojies } from "gemoji";
import FuzzySearch from "fuzzy-search";

import BlockMenu, { Props } from "./CommonBlockMenu";
import EmojiMenuItem from "./EmojiMenuItem";

const searcher = new FuzzySearch(gemojies, ["names"], {
  caseSensitive: true,
  sort: true,
});

type Emoji = {
  name: string;
  title: string;
  emoji: string;
  attrs: { markup: string; "data-name": string };
};

class EmojiMenu extends React.Component<
  Omit<
    Props<Emoji>,
    "renderMenuItem" | "items" | "onLinkToolbarOpen" | "embeds"
  >
> {
  get items(): Emoji[] {
    const { search = "" } = this.props;

    const n = search.toLowerCase();
    const result = searcher.search(n).map(item => {
      const name = item.names[0];
      return {
        ...item,
        name: "emoji",
        title: name,
        attrs: { markup: name, "data-name": name },
      };
    });

    return result.slice(0, 10);
  }

  clearSearch = () => {
    const { state, dispatch } = this.props.view;

    // clear search input
    dispatch(
      state.tr.insertText(
        "",
        state.selection.$from.pos - (this.props.search ?? "").length - 1,
        state.selection.to
      )
    );
  };

  render() {
    return (
      <BlockMenu
        {...this.props}
        filterable={false}
        onClearSearch={this.clearSearch}
        renderMenuItem={(item, _index, options) => {
          return (
            <EmojiMenuItem
              onClick={options.onClick}
              selected={options.selected}
              title={item.title}
              emoji={item.emoji}
            />
          );
        }}
        items={this.items}
      />
    );
  }
}

export default EmojiMenu;
