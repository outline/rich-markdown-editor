// @flow
import * as React from "react";
import { findDOMNode } from "react-dom";
import { Node } from "slate";
import { Editor } from "slate-react";
import ArrowKeyNavigation from "boundless-arrow-key-navigation";
import styled from "styled-components";
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
};

type State = {
  isEditing: boolean,
  isFetching: boolean,
  results: SearchResult[],
  searchTerm: ?string,
};

@keydown
export default class LinkToolbar extends React.Component<Props, State> {
  wrapper: ?HTMLElement;
  input: HTMLInputElement;
  firstDocument: HTMLElement;
  originalValue: string = "";
  state = {
    isEditing: false,
    isFetching: false,
    results: [],
    searchTerm: null,
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
    const element = findDOMNode(this.wrapper);

    if (
      !element ||
      (ev.target instanceof HTMLElement && element.contains(ev.target)) ||
      (ev.button && ev.button !== 0)
    ) {
      return;
    }

    ev.preventDefault();
    this.save(this.input.value);
  };

  search = async () => {
    const { editor } = this.props;
    if (!editor.props.onSearchLink) return;

    this.setState({ isFetching: true });

    if (this.state.searchTerm) {
      try {
        const results = await editor.props.onSearchLink(this.state.searchTerm);
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

  onKeyDown = (ev: SyntheticKeyboardEvent<*>) => {
    switch (ev.which) {
      case 13: // enter
        ev.preventDefault();
        if (!(ev.target instanceof HTMLInputElement)) return;
        return this.save(ev.target.value);
      case 27: // escape
        return this.save(this.originalValue);
      case 40: // down
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
      this.setState({ searchTerm: ev.target.value });
      this.search();
      return;
    }
    this.setState({ results: [] });
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

  setFirstResultRef = (ref: HTMLElement) => {
    this.firstDocument = ref;
  };

  render() {
    const href = this.props.link.data.get("href");
    const hasResults = this.state.results.length > 0;

    return (
      <span ref={ref => (this.wrapper = ref)}>
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
              <OpenIcon light />
            </ToolbarButton>
          )}
          <ToolbarButton onMouseDown={this.removeLink}>
            {this.state.isEditing ? <TrashIcon light /> : <CloseIcon light />}
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
  background: ${props => props.theme.blackLight};
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
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  padding: 4px 8px;
  border: 0;
  margin: 0;
  outline: none;
  color: ${props => props.theme.white};
  flex-grow: 1;
`;
