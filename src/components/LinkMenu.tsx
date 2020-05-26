import * as React from "react";
import { Portal } from "react-portal";
import { EditorView } from "prosemirror-view";
import LinkEditor, { SearchResult } from "./LinkEditor";
import styled from "styled-components";

const SSR = typeof window === "undefined";

type Props = {
  isActive: boolean;
  // commands: Record<string, any>;
  view: EditorView;
  tooltip: typeof React.Component;
  onCreateLink?: (title: string) => Promise<string>;
  onSearchLink?: (term: string) => Promise<SearchResult[]>;
  onClickLink: (url: string) => void;
  onClose: () => void;
};

export default class LinkMenu extends React.Component<Props> {
  menuRef = React.createRef<HTMLDivElement>();

  state = {
    left: -1000,
    top: undefined,
  };

  componentDidUpdate(prevProps) {
    if (!prevProps.isActive && this.props.isActive) {
      const position = this.calculatePosition(this.props);
      this.setState(position);
    }
  }

  calculatePosition(props) {
    const { view } = props;
    const { selection } = view.state;
    const { offsetHeight } = this.menuRef.current;
    const paragraph = view.domAtPos(selection.$from.pos);

    if (!props.isActive || !paragraph.node || SSR) {
      return {
        left: -1000,
        top: 0,
      };
    }

    const { top, left } = paragraph.node.getBoundingClientRect();

    return {
      left: left + window.scrollX,
      top: top + window.scrollY - offsetHeight,
    };
  }

  handleOnCreateLink = async (title: string) => {
    if (!this.props.onCreateLink) {
      return "";
    }

    this.props.onClose();

    // insert text node
    const { dispatch, state } = this.props.view;
    dispatch(
      state.tr
        .insertText(title, state.selection.from, state.selection.to)
        .addMark(
          state.selection.from,
          state.selection.to + title.length,
          state.schema.marks.link.create({ href: "#loading…" })
        )
    );
    this.props.view.focus();

    // const url = await this.props.onCreateLink(title);
  };

  render() {
    const { isActive, onCreateLink, ...rest } = this.props;
    const selection = this.props.view.state.selection;

    console.log(this.state);

    return (
      <Portal>
        <Wrapper
          active={isActive}
          ref={this.menuRef}
          top={this.state.top}
          left={this.state.left}
        >
          <LinkEditor
            from={selection.from}
            to={selection.to}
            onCreateLink={onCreateLink ? this.handleOnCreateLink : undefined}
            {...rest}
          />
        </Wrapper>
      </Portal>
    );
  }
}

// TODO: this is a lot of copy-pasta, will need to consolidate into single display component
const Wrapper = styled.div<{
  active: boolean;
  top: number;
  left: number;
}>`
  padding: 8px 16px;
  position: absolute;
  z-index: ${props => {
    return props.theme.zIndex + 100;
  }};
  top: ${props => props.top}px;
  left: ${props => props.left}px;
  opacity: 0;
  background-color: ${props => props.theme.toolbarBackground};
  border-radius: 4px;
  transform: scale(0.95);
  transition: opacity 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275),
    transform 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transition-delay: 150ms;
  line-height: 0;
  height: 40px;
  box-sizing: border-box;
  pointer-events: none;
  white-space: nowrap;

  &::before {
    content: "";
    display: block;
    width: 24px;
    height: 24px;
    transform: translateX(-50%) rotate(45deg);
    background: ${props => props.theme.toolbarBackground};
    border-radius: 3px;
    z-index: -1;
    position: absolute;
    bottom: -2px;
  }

  * {
    box-sizing: border-box;
  }

  ${({ active }) =>
    active &&
    `
      transform: translateY(-6px) scale(1);
      pointer-events: all;
      opacity: 1;
    `};

  @media print {
    display: none;
  }
`;
