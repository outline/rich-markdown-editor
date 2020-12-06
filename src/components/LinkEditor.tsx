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

export function AddQuestionIcon(props: any) {
  return (
    <Icon {...props}>
      <g transform="scale(0.047, 0.047)">
        <g>
          <g>
            <path d="M509.989,463.656L474.84,361.363c16.906-34.174,25.847-72.265,25.907-110.593c0.102-66.002-25.435-128.411-71.909-175.727
              C382.357,27.718,320.418,1.08,254.433,0.033c-34.571-0.555-68.117,5.815-99.757,18.912c-30.517,12.633-57.884,30.932-81.34,54.388
              c-23.457,23.456-41.756,50.823-54.388,81.34c-13.097,31.64-19.46,65.203-18.913,99.757
              c1.045,65.985,27.684,127.924,75.009,174.406c47.224,46.383,109.472,71.912,175.332,71.911c0.129,0,0.265,0,0.394,0
              c38.328-0.06,76.419-9.001,110.594-25.907l102.293,35.149c3.934,1.352,7.966,2.011,11.954,2.011
              c9.474,0,18.69-3.722,25.678-10.712C511.218,491.359,514.553,476.939,509.989,463.656z M479.824,479.824
              c-1.007,1.007-3.163,2.535-6.304,1.457l-108.394-37.246c-1.603-0.55-3.27-0.824-4.932-0.824c-2.45,0-4.889,0.593-7.098,1.762
              c-31.327,16.573-66.727,25.363-102.374,25.417c-119.55,0.193-218.442-96.91-220.336-216.441
              C29.433,193.81,52.309,137.289,94.8,94.798c42.491-42.49,98.995-65.362,159.151-64.411
              c119.53,1.895,216.625,100.738,216.439,220.336c-0.056,35.648-8.845,71.048-25.417,102.373c-1.962,3.708-2.301,8.063-0.938,12.03
              l37.246,108.394C482.36,476.659,480.832,478.818,479.824,479.824z"/>
          </g>
        </g>
        <g>
          <g>
            <path d="M247.91,362.748c-7.939,0-15.545,6.981-15.178,15.178c0.368,8.223,6.669,15.178,15.178,15.178
              c7.939,0,15.545-6.981,15.178-15.178C262.72,369.702,256.419,362.748,247.91,362.748z"/>
          </g>
        </g>
        <g>
          <g>
            <path d="M247.91,127.674c-41.639,0-75.515,33.876-75.515,75.515c0,8.382,6.796,15.178,15.178,15.178s15.178-6.796,15.178-15.178
              c0-24.9,20.259-45.159,45.159-45.159s45.159,20.259,45.159,45.159s-20.259,45.159-45.159,45.159
              c-8.382,0-15.178,6.796-15.178,15.178v61.905c0,8.382,6.796,15.178,15.178,15.178c8.382,0,15.178-6.795,15.178-15.179v-48.259
              c34.389-7.045,60.337-37.54,60.337-73.982C323.425,161.55,289.549,127.674,247.91,127.674z"/>
          </g>
        </g>
      </g>
    </Icon>
  );
};

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
