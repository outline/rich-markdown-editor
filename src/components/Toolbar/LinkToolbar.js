// @flow
import * as React from "react";
import { findDOMNode } from "react-dom";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Node } from "slate";
import { Editor } from "slate-react";
import styled from "styled-components";
import keydown from "react-keydown";
import CloseIcon from "../Icon/CloseIcon";
import OpenIcon from "../Icon/OpenIcon";
import TrashIcon from "../Icon/TrashIcon";
import Flex from "../Flex";
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

@keydown
@observer
export default class LinkToolbar extends React.Component<Props> {
  wrapper: ?HTMLElement;
  input: HTMLInputElement;
  firstDocument: HTMLElement;
  originalValue: string = "";

  @observable isEditing: boolean = false;
  @observable isFetching: boolean = false;
  @observable resultIds: string[] = [];
  @observable searchTerm: ?string = null;

  componentDidMount() {
    this.originalValue = this.props.link.data.get("href");
    this.isEditing = !!this.originalValue;

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

  // @action
  // search = async () => {
  //   this.isFetching = true;

  //   if (this.searchTerm) {
  //     try {
  //       this.resultIds = await this.props.documents.search(this.searchTerm);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   } else {
  //     this.resultIds = [];
  //   }

  //   this.isFetching = false;
  // };

  // selectDocument = (ev, document) => {
  //   ev.preventDefault();
  //   this.save(document.url);
  // };

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

  onChange = (ev: SyntheticKeyboardEvent<*>) => {
    // try {
    //   new URL(ev.target.value);
    // } catch (err) {
    //   // this is not a valid url, show search suggestions
    //   this.searchTerm = ev.target.value;
    //   this.search();
    //   return;
    // }
    this.resultIds = [];
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

  setFirstDocumentRef = (ref: HTMLElement) => {
    this.firstDocument = ref;
  };

  render() {
    const href = this.props.link.data.get("href");
    // const hasResults = this.resultIds.length > 0;

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
          {this.isEditing && (
            <ToolbarButton onMouseDown={this.openLink}>
              <OpenIcon light />
            </ToolbarButton>
          )}
          <ToolbarButton onMouseDown={this.removeLink}>
            {this.isEditing ? <TrashIcon light /> : <CloseIcon light />}
          </ToolbarButton>
        </LinkEditor>
        {/* {hasResults && (
          <SearchResults>
            <ArrowKeyNavigation
              mode={ArrowKeyNavigation.mode.VERTICAL}
              defaultActiveChildIndex={0}
            >
              {this.resultIds.map((id, index) => {
                const document = this.props.documents.getById(id);
                if (!document) return null;

                return (
                  <DocumentResult
                    innerRef={ref =>
                      index === 0 && this.setFirstDocumentRef(ref)
                    }
                    document={document}
                    key={document.id}
                    onClick={ev => this.selectDocument(ev, document)}
                  />
                );
              })}
            </ArrowKeyNavigation>
          </SearchResults>
        )} */}
      </span>
    );
  }
}

// const SearchResults = styled.div`
//   background: #2f3336;
//   position: absolute;
//   top: 100%;
//   width: 100%;
//   height: auto;
//   left: 0;
//   padding: 8px;
//   margin-top: -3px;
//   margin-bottom: 0;
//   border-radius: 0 0 4px 4px;
// `;

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
  color: #fff;
  flex-grow: 1;
`;
