import * as React from "react";
import { setTextSelection } from "prosemirror-utils";
import { EditorView } from "prosemirror-view";
import { Mark } from "prosemirror-model";
import { TrashIcon, OpenIcon } from "outline-icons";
import styled, { withTheme } from "styled-components";
import theme from "../theme";
import Flex from "./Flex";
import ToolbarButton from "./ToolbarButton";

type Props = {
  mark: Mark;
  from: number;
  to: number;
  tooltip: typeof React.Component;
  view: EditorView;
  theme: typeof theme;
};

class LinkEditor extends React.Component<Props> {
  inputRef = React.createRef<HTMLInputElement>();
  discardInputValue = false;
  initialValue: string = this.props.mark.attrs.href;

  componentWillUnmount = () => {
    if (this.discardInputValue) {
      return;
    }

    // update the link saved as the mark whenever the link editor closes
    const href = (this.inputRef.current.value || "").trim();
    if (!href) {
      return this.handleRemoveLink();
    }

    const { from, to } = this.props;
    const { state, dispatch } = this.props.view;
    const markType = state.schema.marks.link;

    dispatch(
      state.tr
        .removeMark(from, to, markType)
        .addMark(from, to, markType.create({ href }))
    );
  };

  handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      this.moveSelectionToEnd();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      this.inputRef.current.value = this.initialValue;
      this.moveSelectionToEnd();
      return;
    }
  };

  handleChange = () => {
    //
  };

  handleOpenLink = () => {
    window.open(this.props.mark.attrs.href);
  };

  handleRemoveLink = () => {
    this.discardInputValue = true;
    const { from, to, mark } = this.props;
    const { state, dispatch } = this.props.view;

    dispatch(state.tr.removeMark(from, to, mark));
  };

  moveSelectionToEnd = () => {
    const { to, view } = this.props;
    const { state, dispatch } = view;
    dispatch(setTextSelection(to)(state.tr));
    view.focus();
  };

  render() {
    const { mark } = this.props;
    const Tooltip = this.props.tooltip;

    return (
      <Wrapper>
        <Input
          ref={this.inputRef}
          defaultValue={mark.attrs.href}
          placeholder="Search or paste a link…"
          onKeyDown={this.handleKeyDown}
          onChange={this.handleChange}
          autoFocus={mark.attrs.href === ""}
        />
        <ToolbarButton onClick={this.handleOpenLink}>
          <Tooltip tooltip="Open link" placement="top">
            <OpenIcon color={this.props.theme.toolbarItem} />
          </Tooltip>
        </ToolbarButton>
        <ToolbarButton onClick={this.handleRemoveLink}>
          <Tooltip tooltip="Remove link" placement="top">
            <TrashIcon color={this.props.theme.toolbarItem} />
          </Tooltip>
        </ToolbarButton>
      </Wrapper>
    );
  }
}

const Wrapper = styled(Flex)`
  margin-left: -8px;
  margin-right: -8px;
  min-width: 300px;
`;

const Input = styled.input`
  font-size: 15px;
  background: ${props => props.theme.toolbarInput};
  color: ${props => props.theme.toolbarItem};
  border-radius: 2px;
  padding: 4px 8px;
  border: 0;
  margin: 0;
  outline: none;
  flex-grow: 1;
`;

export default withTheme(LinkEditor);
