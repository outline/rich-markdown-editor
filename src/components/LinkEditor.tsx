import * as React from "react";
import { EditorView } from "prosemirror-view";
import { Mark } from "prosemirror-model";
import { TrashIcon, OpenIcon } from "outline-icons";
import styled, { withTheme } from "styled-components";
import getMarkRange from "../queries/getMarkRange";
import theme from "../theme";
import Flex from "./Flex";
import ToolbarButton from "./ToolbarButton";

type Props = {
  link: Mark;
  tooltip: typeof React.Component;
  view: EditorView;
  theme: typeof theme;
};

class LinkEditor extends React.Component<Props> {
  inputRef = React.createRef<HTMLInputElement>();

  componentWillUnmount = () => {
    // update the link saved as the mark whenever the link editor closes
    const href = this.inputRef.current.value || "";
    const { state, dispatch } = this.props.view;
    const markType = state.schema.marks.link;
    console.log(markType);

    const range = getMarkRange(state.selection.$from, markType);
    console.log(range);

    if (!range) return;

    dispatch(
      state.tr
        .removeMark(range.from, range.to, markType)
        .addMark(range.from, range.to, markType.create({ href }))
    );
  };

  handleKeyDown = () => {
    //
  };

  handleChange = event => {
    //
  };

  handleOpenLink = () => {
    window.open(this.props.link.attrs.href);
  };

  handleRemoveLink = () => {
    //
  };

  render() {
    const { link } = this.props;
    const Tooltip = this.props.tooltip;

    return (
      <Wrapper>
        <Input
          ref={this.inputRef}
          defaultValue={link.attrs.href}
          placeholder="Search or paste a link…"
          onKeyDown={this.handleKeyDown}
          onChange={this.handleChange}
          autoFocus={link.attrs.href === ""}
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
