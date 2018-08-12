// @flow
import * as React from "react";
import { findDOMNode } from "react-dom";
import { Node } from "slate";
import { Editor, findDOMNode as slateFindDOMNode } from "slate-react";
import ArrowKeyNavigation from "boundless-arrow-key-navigation/build";
import styled from "react-emotion";
import { withTheme } from "emotion-theming";
import keydown from "react-keydown";
import { CloseIcon, OpenIcon, TrashIcon } from "outline-icons";
import type { SearchResult } from "../../types";
import Flex from "../Flex";
import LinkSearchResult from "./LinkSearchResult";
import ToolbarButton from "./ToolbarButton";

type Suggestion = {
  title: string,
  url: string,
};

type Props = {
  editor: Editor,
  link: Node,
  suggestions?: Suggestion[],
  onBlur: () => *,
  theme: *,
};

type State = {
  isEditing: boolean,
  isFetching: boolean,
  results: SearchResult[],
};

@keydown
class LinkToolbar extends React.Component<Props, State> {
  wrapper: ?HTMLElement;
  input: HTMLInputElement;
  firstDocument: HTMLElement;
  originalValue: string = "";
  state = {
    isEditing: false,
    isFetching: false,
    results: [],
  };

  componentDidMount() {
    this.originalValue = this.props.link.data.get("href");
    this.setState({ isEditing: !!this.originalValue });

    setImmediate(() =>
      window.addEventListener("click", this.handleOutsideMouseClick)
    );
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.handleOutsideMouseClick);
  }

  handleOutsideMouseClick = (ev: SyntheticMouseEvent<*>) => {
    // check if we're clicking inside the link toolbar
    const element = findDOMNode(this.wrapper);
    if (
      !element ||
      (ev.target instanceof HTMLElement && element.contains(ev.target)) ||
      (ev.button && ev.button !== 0)
    ) {
      return;
    }

    // check if we're clicking inside the link text
    try {
      const linkElement = slateFindDOMNode(this.props.link);

      if (
        !linkElement ||
        (ev.target instanceof HTMLElement && linkElement.contains(ev.target)) ||
        (ev.button && ev.button !== 0)
      ) {
        return;
      }
    } catch (err) {
      // errors finding dom node result in toolbar closing
    }

    // otherwise, we're clicking outside
    ev.preventDefault();
    this.save(this.input.value);
  };

  search = async (term: string) => {
    const { editor } = this.props;
    if (!editor.props.onSearchLink) return;

    this.setState({ isFetching: true });

    if (term) {
      try {
        const results = await editor.props.onSearchLink(term);
        this.setState({ results });
      } catch (err) {
        console.error(err);
      }
    } else {
      this.setState({ results: [] });
    }

    this.setState({ isFetching: false });
  };

  selectSearchResult = (ev: SyntheticEvent<*>, url: string) => {
    ev.preventDefault();
    this.save(url);
  };

  cancel = () => {
    this.save(this.originalValue);
  };

  onKeyDown = (ev: SyntheticKeyboardEvent<*>) => {
    switch (ev.key) {
      case "Enter":
        ev.preventDefault();
        if (!(ev.target instanceof HTMLInputElement)) return;
        return this.save(ev.target.value);
      case "Escape":
        ev.preventDefault();
        ev.stopPropagation();
        return this.cancel();
      case "ArrowDown":
        ev.preventDefault();
        if (this.firstDocument) {
          const element = findDOMNode(this.firstDocument);
          if (element instanceof HTMLElement) element.focus();
        }
        break;
      default:
    }
  };

  onChange = (ev: SyntheticInputEvent<*>) => {
    if (!this.props.editor.props.onSearchLink) return;

    try {
      new URL(ev.target.value);
    } catch (err) {
      // this is not a valid url, show search suggestions
      this.search(ev.target.value);
      return;
    }
    this.setState({ results: [] });
  };

  onResultKeyDown = (ev: SyntheticKeyboardEvent<*>) => {
    if (ev.key === "Escape") {
      ev.preventDefault();
      ev.stopPropagation();
      this.cancel();
    }
  };

  removeLink = () => {
    this.save("");
  };

  openLink = () => {
    const href = this.props.link.data.get("href");
    window.open(href, "_blank");
  };

  save = (href: string) => {
    const { editor, link } = this.props;
    href = href.trim();

    editor.change(change => {
      if (href) {
        change.setNodeByKey(link.key, { type: "link", data: { href } });
      } else if (link) {
        change.unwrapInlineByKey(link.key);
      }
      change.deselect();
      this.props.onBlur();
    });
  };

  setFirstResultRef = (ref: *) => {
    this.firstDocument = ref;
  };

  setWrapperRef = (ref: *) => {
    this.wrapper = ref;
  };

  render() {
    const href = this.props.link.data.get("href");
    const hasResults = this.state.results.length > 0;

    return (
      <span ref={this.setWrapperRef}>
        <LinkEditor>
          <Input
            innerRef={ref => (this.input = ref)}
            defaultValue={href}
            placeholder="Search or paste a link…"
            onKeyDown={this.onKeyDown}
            onChange={this.onChange}
            autoFocus={href === ""}
          />
          {this.state.isEditing && (
            <ToolbarButton onMouseDown={this.openLink}>
              <OpenIcon color={this.props.theme.toolbarItem} />
            </ToolbarButton>
          )}
          <ToolbarButton onMouseDown={this.removeLink}>
            {this.state.isEditing ? (
              <TrashIcon color={this.props.theme.toolbarItem} />
            ) : (
              <CloseIcon color={this.props.theme.toolbarItem} />
            )}
          </ToolbarButton>
        </LinkEditor>
        {hasResults && (
          <SearchResults>
            <ArrowKeyNavigation
              mode={ArrowKeyNavigation.mode.VERTICAL}
              defaultActiveChildIndex={0}
            >
              {this.state.results.map((result, index) => (
                <LinkSearchResult
                  innerRef={ref => index === 0 && this.setFirstResultRef(ref)}
                  title={result.title}
                  key={result.url}
                  onClick={ev => this.selectSearchResult(ev, result.url)}
                  onKeyDown={this.onResultKeyDown}
                />
              ))}
            </ArrowKeyNavigation>
          </SearchResults>
        )}
      </span>
    );
  }
}

const SearchResults = styled.div`
  background: ${props => props.theme.toolbarBackground};
  position: absolute;
  top: 100%;
  width: 100%;
  height: auto;
  left: 0;
  padding: 8px;
  margin-top: -3px;
  margin-bottom: 0;
  border-radius: 0 0 4px 4px;
`;

const LinkEditor = styled(Flex)`
  margin-left: -8px;
  margin-right: -8px;
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

export default withTheme(LinkToolbar);
