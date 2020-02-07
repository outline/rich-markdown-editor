import * as React from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { withTheme } from "styled-components";
import ToolbarButton from "./ToolbarButton";
import ToolbarSeparator from "./ToolbarSeparator";
import theme from "../theme";

type MenuItem = {
  name: string | "separator";
  tooltip?: string;
  icon?: typeof React.Component;
  attrs?: Record<string, any>;
  active?: (state: EditorState) => boolean;
};

type Props = {
  tooltip: typeof React.Component;
  commands: Record<string, any>;
  view: EditorView;
  theme: typeof theme;
  items: MenuItem[];
};

class Menu extends React.Component<Props> {
  render() {
    const { view, items } = this.props;
    const { state } = view;
    const Tooltip = this.props.tooltip;

    return (
      <div>
        {items.map((item, index) => {
          if (item.name === "separator") {
            return <ToolbarSeparator key={index} />;
          }
          const Icon = item.icon;
          const isActive = item.active(state);

          return (
            <ToolbarButton
              key={index}
              onClick={() => this.props.commands[item.name](item.attrs)}
              active={isActive}
            >
              <Tooltip tooltip={item.tooltip} placement="top">
                <Icon color={this.props.theme.toolbarItem} />
              </Tooltip>
            </ToolbarButton>
          );
        })}
      </div>
    );
  }
}

export default withTheme(Menu);
