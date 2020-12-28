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
          this.handleCreateLink(this.suggestedLinkTitle);
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
          const normalizedResultObj = {
            searchCardUser: resultObj.searchCardUser || [],
            searchCardSubscriptions: resultObj.searchCardSubscriptions || [],
            wiki: resultObj.wiki || [],
            searchCardPublic: resultObj.searchCardPublic || [],
            ...resultObj
          };
          const results = (Object.values(normalizedResultObj) as any).flat(1);
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
    // create card on top, should be default action. order of search results

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
