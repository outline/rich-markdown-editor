import * as React from "react";
import { setTextSelection } from "prosemirror-utils";
import { EditorView } from "prosemirror-view";
import { Mark } from "prosemirror-model";
import {
  CloseIcon,
  TrashIcon,
  OpenIcon,
  Icon,
} from "outline-icons";
import styled, { withTheme } from "styled-components";
import isUrl from "../lib/isUrl";
import theme from "../theme";
import Flex from "./Flex";
import Input from "./Input";
import ToolbarButton from "./ToolbarButton";

function LineWeightIcon(props: any) {
  return (
    <Icon {...props}>
      <path d="M3 17h18v-2H3v2zm0 3h18v-1H3v1zm0-7h18v-3H3v3zm0-9v4h18V4H3z" />
    </Icon>
  );
}

export type SearchResult = {
  title: string;
  url: string;
};

type Props = {
  mark?: Mark;
  from: number;
  to: number;
  tooltip: typeof React.Component;
  onRemoveLink?: () => void;
  onSearchLink?: (term: any) => void;
  onSelectLink: (options: {
    href: string;
    title?: string;
    from: number;
    to: number;
  }) => void;
  onClickLink: (url: string) => void;
  onShowToast?: (message: string, code: string) => void;
  view: EditorView;
  theme: typeof theme;
  selectedText: string;
};

type State = {
  value: string;
};

class LinkEditor extends React.Component<Props, State> {
  discardInputValue = false;
  initialValue = this.href;
  initialSelectionLength = this.props.to - this.props.from;

  state: State = {
    value: this.href || this.props.selectedText,
  };

  get href(): string {
    return this.props.mark ? this.props.mark.attrs.href : "";
  }

  componentWillUnmount = () => {
    // If we discarded the changes then nothing to do
    if (this.discardInputValue) {
      return;
    }

    // If the link is the same as it was when the editor opened, nothing to do
    if (this.state.value === this.initialValue) {
      return;
    }

    // If the link is totally empty or only spaces then remove the mark
    const href = (this.state.value || "").trim();
    if (!href) {
      return this.handleRemoveLink();
    }

    this.save(href, href);
  };

  save = (href: string, title?: string): void => {
    href = href.trim();

    if (href.length === 0) return;

    this.discardInputValue = true;
    const { from, to } = this.props;

    // If the input doesn't start with a protocol or relative slash, make sure
    // a protocol is added to the beginning
    if (!isUrl(href) && !href.startsWith("/")) {
      href = `https://${href}`;
    }

    this.props.onSelectLink({ href, title, from, to });
  };

  handleKeyDown = (event: React.KeyboardEvent): void => {
    switch (event.key) {
      case "Enter": {
        event.preventDefault();
        const { value } = this.state;

        // saves the raw input as href
        this.save(value, value);

        if (this.initialSelectionLength) {
          this.moveSelectionToEnd();
        }

        return;
      }

      case "Escape": {
        event.preventDefault();

        if (this.initialValue) {
          this.setState({ value: this.initialValue }, this.moveSelectionToEnd);
        } else {
          this.handleRemoveLink();
        }
        return;
      }
    }
  };

  handleChange = async (event): Promise<void> => {
    const value = event.target.value;
    const { from, to } = this.props;
    this.props.onSearchLink && this.props.onSearchLink({ triggerSearch: value, searchSource: "linkEditor", linkFrom: from, linkTo: to });
    // const looksLikeUrl = isUrl(value);

    this.setState({
      value,
    });
  };

  handleOpenLink = (event): void => {
    event.preventDefault();
    this.props.onClickLink(this.href);
  };

  handleRemoveLink = (): void => {
    this.discardInputValue = true;

    const { from, to, mark, view, onRemoveLink } = this.props;
    const { state, dispatch } = this.props.view;

    if (mark) {
      dispatch(state.tr.removeMark(from, to, mark));
    }

    if (onRemoveLink) {
      onRemoveLink();
    }

    view.focus();
  };

  moveSelectionToEnd = () => {
    const { to, view } = this.props;
    const { state, dispatch } = view;
    dispatch(setTextSelection(to)(state.tr));
    view.focus();
  };


  componentDidUpdate() {
    if (this.href !== this.initialValue) {
      this.initialValue = this.href;
      this.setState({ value: this.href });
    }
  }

  toggleLinkWeight = () => {
    const { value } = this.state;
    if (value.includes("weight=0")) {
      this.setState({ value: value.replace("weight=0", "weight=-10") });
    } else if (value.includes("weight=-10")) {
      this.setState({ value: value.replace("weight=-10", "weight=10") });
    } else if (value.includes("weight=10")) {
      this.setState({ value: value.replace("weight=10", "weight=0") });
    } else if (!(value.includes("weight="))) {
      this.setState({ value: `${value}/?weight=0` });
    }
  }

  render() {
    const { theme, from, to } = this.props;
    const { value } = this.state;

    const Tooltip = this.props.tooltip;
    const internalLink = !value.includes("//");

    return (
      <Wrapper>
        <Input
          value={value}
          placeholder={"Find or create a card…"}
          onKeyDown={this.handleKeyDown}
          onChange={this.handleChange}
          autoFocus={this.href === ""}
          onFocus={() => {
            this.props.onSearchLink && this.props.onSearchLink({ triggerSearch: value, searchSource: "linkEditor", linkFrom: from, linkTo: to });
          }}
        />

        <ToolbarButton onClick={this.handleOpenLink} disabled={!value}>
          <Tooltip tooltip="Open link" placement="top">
            <OpenIcon color={theme.toolbarItem} />
          </Tooltip>
        </ToolbarButton>
        <ToolbarButton onClick={this.handleRemoveLink}>
          <Tooltip tooltip="Remove link" placement="top">
            {this.initialValue ? (
              <TrashIcon color={theme.toolbarItem} />
            ) : (
              <CloseIcon color={theme.toolbarItem} />
            )}
          </Tooltip>
        </ToolbarButton>
        {internalLink && (
          <ToolbarButton onClick={this.toggleLinkWeight}>
            <Tooltip tooltip="Link weight determines where linked card will appear in your graph: positive is to the right of this card (default), negative to the left of this card, or 0 for no positional relation" placement="top">
              <LineWeightIcon color={theme.toolbarItem} />
            </Tooltip>
          </ToolbarButton>
        )}
      </Wrapper>
    );
  }
}

const Wrapper = styled(Flex)`
  margin-left: -8px;
  margin-right: -8px;
  min-width: 336px;
`;

export default withTheme(LinkEditor);
