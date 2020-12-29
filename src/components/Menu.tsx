import * as React from "react";
import { EditorView } from "prosemirror-view";
import { withTheme } from "styled-components";
import ToolbarButton from "./ToolbarButton";
import ToolbarSeparator from "./ToolbarSeparator";
import theme from "../theme";
import { MenuItem } from "../types";
import { iOS, android } from "./SelectionToolbar";

type Props = {
  tooltip: typeof React.Component | React.FC<any>;
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
          if (item.name === "separator" && item.visible !== false) {
            return <ToolbarSeparator key={index} />;
          }
          if (item.visible === false || !item.icon) {
            return null;
          }
          const Icon = item.icon;
          const isActive = item.active ? item.active(state) : false;

          return (
            <ToolbarButton
              key={index}
              onClick={() => {
                item.name && this.props.commands[item.name](item.attrs);
              }}
              childWidth={item.name === "link" ? "85px" : undefined}
              active={isActive}
            >
              <Tooltip tooltip={item.tooltip} placement="top">
                <Icon color={this.props.theme.toolbarItem} />
                {item.name === "link" && (
                  <sup style={{ fontSize: "small", marginLeft: "5px" }}>
                    Add link
                  </sup>
                )}
              </Tooltip>
            </ToolbarButton>
          );
        })}
      </div>
    );
  }
}

export default withTheme(Menu);
