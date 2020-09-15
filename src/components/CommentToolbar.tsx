import * as React from "react";
import { Portal } from "react-portal";
import { CommentIcon } from "outline-icons";
import { EditorView } from "prosemirror-view";
import FloatingToolbar from "./FloatingToolbar";
import ToolbarButton from "./ToolbarButton";
import isNodeActive from "../queries/isNodeActive";
import { isCommentActive } from "../plugins/Comments";
import styled, { withTheme } from "styled-components";
import theme from "../theme";

type Props = {
  tooltip: typeof React.Component | React.FC<any>;
  isTemplate: boolean;
  commands: Record<string, any>;
  theme: typeof theme;
  view: EditorView;
};

function isActive(props) {
  const { view } = props;
  const { selection } = view.state;

  return selection && !selection.empty && !selection.node;
}

class CommentToolbar extends React.Component<Props> {
  render() {
    const { view, isTemplate } = this.props;
    const { state } = view;
    const isCodeSelection = isNodeActive(state.schema.nodes.code_block)(state);

    // toolbar is disabled in code blocks, no bold / italic etc
    if (isCodeSelection || isTemplate || isCommentActive(view.state)) {
      return null;
    }

    return (
      <Portal>
        <FloatingToolbar view={view} active={isActive(this.props)}>
          <ToolbarButton
            onClick={() => this.props.commands.comments({ force: true })}
          >
            <CommentIcon color={this.props.theme.toolbarItem} />{" "}
            <Text>Add a comment</Text>
          </ToolbarButton>
        </FloatingToolbar>
      </Portal>
    );
  }
}

const Text = styled("span")`
  color: ${props => props.theme.toolbarItem};
  font-size: 14px;
  margin-left: 4px;
`;

export default withTheme(CommentToolbar);
