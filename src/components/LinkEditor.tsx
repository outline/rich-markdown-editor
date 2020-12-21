import * as React from "react";
import { setTextSelection } from "prosemirror-utils";
import { EditorView } from "prosemirror-view";
import { Mark } from "prosemirror-model";
import {
  DocumentIcon,
  CloseIcon,
  ArchiveIcon,
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
import LinkSearchResult from "./LinkSearchResult";
import baseDictionary from "../dictionary";
import { iOS, android } from "./SelectionToolbar";

export function AddCardIcon(props: any) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="scale(0.6, 0.6)">
        <rect width="40" height="40" rx="20" fill="#0094FF" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M21 12H19V21V28H21V23L19 21H21V12Z"
          fill="white"
        />
        <rect
          x="12"
          y="21"
          width="2"
          height="16"
          transform="rotate(-90 12 21)"
          fill="white"
        />
      </g>
    </svg>
  );
}

export function AddQuestionIcon(props: any) {
  return (
    <>
      <Icon {...props}>
        <g transform="scale(0.047, 0.047)">
          <g>
            <g>
              <path
                d="M509.989,463.656L474.84,361.363c16.906-34.174,25.847-72.265,25.907-110.593c0.102-66.002-25.435-128.411-71.909-175.727
                C382.357,27.718,320.418,1.08,254.433,0.033c-34.571-0.555-68.117,5.815-99.757,18.912c-30.517,12.633-57.884,30.932-81.34,54.388
                c-23.457,23.456-41.756,50.823-54.388,81.34c-13.097,31.64-19.46,65.203-18.913,99.757
                c1.045,65.985,27.684,127.924,75.009,174.406c47.224,46.383,109.472,71.912,175.332,71.911c0.129,0,0.265,0,0.394,0
                c38.328-0.06,76.419-9.001,110.594-25.907l102.293,35.149c3.934,1.352,7.966,2.011,11.954,2.011
                c9.474,0,18.69-3.722,25.678-10.712C511.218,491.359,514.553,476.939,509.989,463.656z M479.824,479.824
                c-1.007,1.007-3.163,2.535-6.304,1.457l-108.394-37.246c-1.603-0.55-3.27-0.824-4.932-0.824c-2.45,0-4.889,0.593-7.098,1.762
                c-31.327,16.573-66.727,25.363-102.374,25.417c-119.55,0.193-218.442-96.91-220.336-216.441
                C29.433,193.81,52.309,137.289,94.8,94.798c42.491-42.49,98.995-65.362,159.151-64.411
                c119.53,1.895,216.625,100.738,216.439,220.336c-0.056,35.648-8.845,71.048-25.417,102.373c-1.962,3.708-2.301,8.063-0.938,12.03
                l37.246,108.394C482.36,476.659,480.832,478.818,479.824,479.824z"
              />
            </g>
          </g>
          <g>
            <g>
              <path
                d="M247.91,362.748c-7.939,0-15.545,6.981-15.178,15.178c0.368,8.223,6.669,15.178,15.178,15.178
                c7.939,0,15.545-6.981,15.178-15.178C262.72,369.702,256.419,362.748,247.91,362.748z"
              />
            </g>
          </g>
          <g>
            <g>
              <path
                d="M247.91,127.674c-41.639,0-75.515,33.876-75.515,75.515c0,8.382,6.796,15.178,15.178,15.178s15.178-6.796,15.178-15.178
                c0-24.9,20.259-45.159,45.159-45.159s45.159,20.259,45.159,45.159s-20.259,45.159-45.159,45.159
                c-8.382,0-15.178,6.796-15.178,15.178v61.905c0,8.382,6.796,15.178,15.178,15.178c8.382,0,15.178-6.795,15.178-15.179v-48.259
                c34.389-7.045,60.337-37.54,60.337-73.982C323.425,161.55,289.549,127.674,247.91,127.674z"
              />
            </g>
          </g>
        </g>
      </Icon>
      <sup style={{ fontSize: "small", marginLeft: "5px" }}>Add question</sup>
    </>
  );
}

export type SearchResult = {
  title: string;
  subtitle?: string;
  userName?: string;
  url: string;
};

type Props = {
  mark?: Mark;
  from: number;
  to: number;
  tooltip: typeof React.Component | React.FC<any>;
  dictionary: typeof baseDictionary;
  onRemoveLink?: () => void;
  onCreateLink?: (title: string, turnIntoCards?: boolean) => Promise<void>;
  onTurnIntoCards?: (href: string) => Promise<string>;
  onSearchLink?: (term: string, setter: (resultObj: object) => void) => void;
  Avatar: typeof React.Component | React.FC<any>;
  onSelectLink: (options: {
    href: string;
    title?: string;
    from: number;
    to: number;
  }) => void;
  onClickLink: (href: string, event: MouseEvent) => void;
  onShowToast?: (message: string, code: string) => void;
  view: EditorView;
  theme: typeof theme;
  selectedText?: string;
};

type State = {
  results: {
    [keyword: string]: SearchResult[];
  };
  value: string;
  previousValue: string;
  selectedIndex: number;
};

class LinkEditor extends React.Component<Props, State> {
  discardInputValue = false;
  initialValue = this.href;
  initialSelectionLength = this.props.to - this.props.from;

  state: State = {
    selectedIndex: -1,
    value: this.href || this.props.selectedText || "",
    previousValue: "",
    results: {},
  };

  get href(): string {
    return this.props.mark ? this.props.mark.attrs.href : "";
  }

  get suggestedLinkTitle(): string {
    const { state } = this.props.view;
    const { value } = this.state;
    const selectionText = state.doc.cut(
      state.selection.from,
      state.selection.to
    ).textContent;

    return value.trim() || selectionText.trim();
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
        const { selectedIndex, value } = this.state;
        const results = this.state.results[value] || [];

        const looksLikeUrl = value.match(/^https?:\/\//i);

        if (selectedIndex >= 0) {
          const result = results[selectedIndex];
          if (result) {
            this.save(result.url, result.title);
          } else if (looksLikeUrl && selectedIndex === results.length) {
            this.handleCreateLink(value, true);
          } else if (!looksLikeUrl && selectedIndex === results.length) {
            this.handleCreateLink(this.suggestedLinkTitle);
          }
        } else {
          // saves the raw input as href
          this.save(value, value);
        }

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

      case "ArrowUp": {
        if (event.shiftKey) return;
        event.preventDefault();
        event.stopPropagation();
        const prevIndex = this.state.selectedIndex - 1;

        this.setState({
          selectedIndex: Math.max(-1, prevIndex),
        });
        return;
      }

      case "ArrowDown":
        if (event.shiftKey) return;
      case "Tab": {
        event.preventDefault();
        event.stopPropagation();
        const { selectedIndex, value } = this.state;
        const results = this.state.results[value] || [];
        const total = results.length;
        const nextIndex = selectedIndex + 1;

        this.setState({
          selectedIndex: Math.min(nextIndex, total),
        });
        return;
      }
    }
  };

  handleFocusLink = (selectedIndex: number) => {
    this.setState({ selectedIndex });
  };

  handleChange = async (event): Promise<void> => {
    const value = event.target.value;

    this.setState({
      value,
      selectedIndex: -1,
    });

    const trimmedValue = value.trim();

    if (trimmedValue && this.props.onSearchLink) {
      try {
        const setter = resultObj => {
          const results = (Object.values(resultObj) as any).flat(1);
          this.setState(state => ({
            results: {
              ...state.results,
              [trimmedValue]: results,
            },
            previousValue: trimmedValue,
          }));
        };
        this.props.onSearchLink(trimmedValue, setter);
      } catch (error) {
        console.error(error);
      }
    }
  };

  handleOpenLink = (event): void => {
    event.preventDefault();
    this.props.onClickLink(this.href, event);
  };

  handleCreateLink = (value: string, turnIntoCards = false) => {
    this.discardInputValue = true;
    const { onCreateLink } = this.props;

    value = value.trim();
    if (value.length === 0) return;

    if (onCreateLink) return onCreateLink(value, turnIntoCards);
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

  handleSelectLink = (url: string, title: string) => event => {
    event.preventDefault();
    this.save(url, title);

    if (this.initialSelectionLength) {
      this.moveSelectionToEnd();
    }
  };

  moveSelectionToEnd = () => {
    const { to, view } = this.props;
    const { state, dispatch } = view;
    dispatch(setTextSelection(to)(state.tr));
    view.focus();
  };

  componentDidMount() {
    if (this.state.value) {
      this.handleChange({ target: { value: this.state.value } });
    }
  }

  render() {
    const { dictionary, theme, Avatar } = this.props;
    const { value, selectedIndex } = this.state;
    const looksLikeUrl = value.match(/^https?:\/\//i);
    const showTurnInto = !!looksLikeUrl;
    const results = showTurnInto
      ? []
      : this.state.results[value.trim()] ||
        this.state.results[this.state.previousValue] ||
        [];

    const Tooltip = this.props.tooltip;

    const suggestedLinkTitle = this.suggestedLinkTitle;

    const showCreateLink =
      !!this.props.onCreateLink &&
      !(suggestedLinkTitle === this.initialValue) &&
      suggestedLinkTitle.length > 0 &&
      !looksLikeUrl;

    const showResults =
      !!suggestedLinkTitle &&
      (showCreateLink || showTurnInto || results.length > 0);

    return (
      <Wrapper>
        <Input
          value={value}
          placeholder={
            showCreateLink
              ? dictionary.findOrCreateDoc
              : dictionary.searchOrPasteLink
          }
          onKeyDown={this.handleKeyDown}
          onChange={this.handleChange}
          autoFocus={this.href === ""}
        />

        <ToolbarButton onClick={this.handleOpenLink} disabled={!value}>
          <Tooltip tooltip={dictionary.openLink} placement="top">
            <OpenIcon color={theme.toolbarItem} />
          </Tooltip>
        </ToolbarButton>
        <ToolbarButton onClick={this.handleRemoveLink}>
          <Tooltip tooltip={dictionary.removeLink} placement="top">
            {this.initialValue ? (
              <TrashIcon color={theme.toolbarItem} />
            ) : (
              <CloseIcon color={theme.toolbarItem} />
            )}
          </Tooltip>
        </ToolbarButton>

        {showResults && (
          <SearchResults id="link-search-results">
            {results.map((result, index) => (
              <LinkSearchResult
                key={result.url}
                title={result.title}
                subtitle={result.subtitle}
                icon={<Avatar user={{ userName: result.userName }} size={24} />}
                onMouseOver={() => this.handleFocusLink(index)}
                onClick={this.handleSelectLink(result.url, result.title)}
                selected={index === selectedIndex}
              />
            ))}

            {showTurnInto && (
              <LinkSearchResult
                key="turninto"
                title={suggestedLinkTitle}
                subtitle={dictionary.turnIntoCards}
                icon={<ArchiveIcon color={theme.toolbarItem} />}
                onMouseOver={() => this.handleFocusLink(results.length)}
                onClick={() => {
                  this.handleCreateLink(value, true);

                  if (this.initialSelectionLength) {
                    this.moveSelectionToEnd();
                  }
                }}
                selected={results.length === selectedIndex}
              />
            )}

            {showCreateLink && (
              <LinkSearchResult
                key="create"
                title={suggestedLinkTitle}
                subtitle={dictionary.createNewDoc}
                icon={<AddCardIcon />}
                onMouseOver={() => this.handleFocusLink(results.length)}
                onClick={() => {
                  this.handleCreateLink(suggestedLinkTitle);

                  if (this.initialSelectionLength) {
                    this.moveSelectionToEnd();
                  }
                }}
                selected={results.length === selectedIndex}
              />
            )}
          </SearchResults>
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

const SearchResults = styled.ol`
  background: ${props => props.theme.toolbarBackground};
  position: absolute;
  ${props => (iOS() || android() ? "top" : "bottom")}: 100%;
  width: 100%;
  height: auto;
  left: 0;
  padding: 4px 8px 8px;
  margin: 0;
  margin-top: -3px;
  margin-bottom: 0;
  border-radius: 0 0 4px 4px;
  overflow-y: auto;
  max-height: 25vh;
`;

export default withTheme(LinkEditor);
