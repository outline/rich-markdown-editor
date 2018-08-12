// @flow
import * as React from "react";
import styled from "react-emotion";
import { Editor } from "slate-react";
import { Block } from "slate";
import { List } from "immutable";

import headingToSlug from "../lib/headingToSlug";

type Props = {
  editor: Editor,
};

type State = {
  activeHeading: ?string,
};
class Contents extends React.Component<Props, State> {
  state = {
    activeHeading: undefined,
  };

  componentDidMount() {
    window.addEventListener("scroll", this.updateActiveHeading);
    this.updateActiveHeading();
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.updateActiveHeading);
  }

  updateActiveHeading = () => {
    const elements = this.getHeadingElements();
    if (!elements.length) return;

    let activeHeading = elements[0].id;

    for (const element of elements) {
      const bounds = element.getBoundingClientRect();
      if (bounds.top <= 0) activeHeading = element.id;
    }

    if (this.state.activeHeading !== activeHeading) {
      this.setState({ activeHeading });
    }
  };

  getHeadingElements(): HTMLElement[] {
    const elements = [];
    const tagNames = ["h1", "h2", "h3", "h4", "h5", "h6"];

    for (const tagName of tagNames) {
      for (const ele of document.getElementsByTagName(tagName)) {
        elements.push(ele);
      }
    }

    return elements;
  }

  getHeadings(): List<Block> {
    const { editor } = this.props;

    return editor.value.document.nodes.filter((node: Block) => {
      if (!node.text) return false;
      return node.type.match(/^heading/);
    });
  }

  render() {
    const { editor } = this.props;
    const headings = this.getHeadings();

    // If there are one or less headings in the document no need for a minimap
    if (headings.size <= 1) return null;

    return (
      <Wrapper>
        <Sections>
          {headings.map(heading => {
            const slug = headingToSlug(editor.value.document, heading);
            const active = this.state.activeHeading === slug;

            return (
              <ListItem type={heading.type} active={active} key={slug}>
                <Anchor href={`#${slug}`} active={active}>
                  {heading.text}
                </Anchor>
              </ListItem>
            );
          })}
        </Sections>
      </Wrapper>
    );
  }
}

const Wrapper = styled.div`
  font-family: ${props => props.theme.fontFamily};
  font-weight: ${props => props.theme.fontWeight};
  font-size: 1em;
  line-height: 1.4;
  position: fixed;
  right: 0;
  top: 150px;
  z-index: 100;

  @media print {
    display: none;
  }
`;

const Anchor = styled.a`
  color: ${props =>
    props.active ? props.theme.text : props.theme.textSecondary};
  font-weight: ${props => (props.active ? 500 : 400)};
  opacity: 0;
  transition: all 100ms ease-in-out;
  margin-right: -5px;
  padding: 2px 0;
  pointer-events: none;
  text-overflow: ellipsis;
  text-decoration: none;

  &:hover {
    color: ${props => props.theme.primary};
  }
`;

const ListItem = styled.li`
  position: relative;
  margin-left: ${props => (props.type.match(/heading[12]/) ? "8px" : "16px")};
  text-align: right;
  color: ${props => props.theme.textSecondary};
  padding-right: 16px;
  white-space: nowrap;

  &:after {
    color: ${props =>
      props.active ? props.theme.text : props.theme.textSecondary};
    content: "${props => (props.type.match(/heading[12]/) ? "—" : "–")}";
    position: absolute;
    right: 0;
  }
`;

const Sections = styled.ol`
  margin: 0 0 0 -8px;
  padding: 0;
  list-style: none;
  font-size: 13px;
  width: 100px;
  transition-delay: 1s;
  transition: width 100ms ease-in-out;

  &:hover {
    width: 300px;
    transition-delay: 0s;

    ${Anchor} {
      opacity: 1;
      margin-right: 0;
      background: ${props => props.theme.background};
      pointer-events: all;
    }
  }
`;

export default Contents;
