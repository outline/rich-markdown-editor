import * as React from "react";
import { EditorView } from "prosemirror-view";
import { withTheme } from "styled-components";
import ToolbarButton from "./ToolbarButton";
import ToolbarSeparator from "./ToolbarSeparator";
import theme from "../theme";
import { MenuItem } from "../types";
import { getText } from "./SelectionToolbar";

type Props = {
  tooltip: typeof React.Component | React.FC<any>;
  onCreateFlashcard?: (txt?: string, surroundTxt?: string) => void;
  commands: Record<string, any>;
  view: EditorView;
  theme: typeof theme;
  items: MenuItem[];
};

const getParent = (selection, state) => {
  const selectionStart = selection.$from;
  let depth = selectionStart.depth;
  let parent;
  do {
    parent = selectionStart.node(depth);
    if (parent) {
      if (parent.type === state.schema.nodes.theNodeTypeImLookingFor) {
        break;
      }
      depth--;
    }
  } while (depth > 0 && parent);
  return parent;
};

class Menu extends React.Component<Props> {
  render() {
    const { view, items } = this.props;
    const { state } = view;
    const Tooltip = this.props.tooltip;

    const getSelection = () => {
      const selection = view?.state?.selection;
      const selectionContent = selection?.content();
      const selectedText =
        (selectionContent && getText(selectionContent)) || "";
      const parent = getParent(selection, view.state);
      const surroundingText = parent ? getText(parent) : selectedText;
      return [selectedText, surroundingText];
    };

    return (
      <div>
        {items.map((item, index) => {
          if (item.name === "separator" && item.visible !== false) {
            return <ToolbarSeparator key={index} />;
          }
          if (item.text && this.props.onCreateFlashcard) {
            const [selectedText, surroundingText] = getSelection();
            return (
              <button
                style={{
                  transform: "translate(0, -8px)",
                  border: "none",
                  marginLeft: "10px",
                  backgroundColor: "#C4C4C4",
                  lineHeight: "24px",
                  cursor: "pointer",
                  filter: "drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.25))",
                }}
                className="onboarding-flashcard"
                onClick={() =>
                  this.props.onCreateFlashcard &&
                  this.props.onCreateFlashcard(selectedText, surroundingText)
                }
                key={index}
              >
                {item.text}
              </button>
            );
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
