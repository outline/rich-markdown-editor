// @flow
import * as React from "react";
import styled from "styled-components";
import { CollapsedIcon } from "outline-icons";
import type { SlateNodeProps } from "../types";
import headingToSlug from "../lib/headingToSlug";
import CopyToClipboard from "./CopyToClipboard";

type Props = SlateNodeProps & {
  component: "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
  hasPretitle: boolean,
  className: string,
};

function Heading(props: Props) {
  const {
    node,
    editor,
    readOnly,
    children,
    component = "h1",
    attributes,
    className,
  } = props;

  const firstNode = editor.value.document.nodes.first() === node;
  const slugish = headingToSlug(editor.value.document, node);
  const showHash = readOnly && !!slugish;
  const Component = component;
  const pretitle = editor.props.pretitle || "";
  const title = node.text.trim();
  const startsWithPretitleAndSpace =
    pretitle && title.match(new RegExp(`^${pretitle}\\s`));
  const pathToHeading = `${window.location.pathname}#${slugish}`;
  const collapsed = node.data.get("collapsed");

  return (
    <Component {...attributes} className={className}>
      <HiddenAnchor id={slugish} />
      <CollapseToggle
        onClick={() => editor.toggleContentBelow(node)}
        contentEditable={false}
        collapsed={collapsed}
        disabled={firstNode}
      >
        <CollapsedIcon />
      </CollapseToggle>
      <Wrapper hasPretitle={startsWithPretitleAndSpace}>{children}</Wrapper>
      {showHash && (
        <Anchor
          name={slugish}
          onCopy={() =>
            editor.props.onShowToast &&
            editor.props.onShowToast("Link copied to clipboard")
          }
          text={`${window.location.origin}${pathToHeading}`}
        >
          <span>#</span>
        </Anchor>
      )}
    </Component>
  );
}

const CollapseToggle = styled.a`
  opacity: ${props => (props.disabled ? "0" : "1")};
  pointer-events: ${props => (props.disabled ? "none" : "all")};
  visibility: ${props => (props.collapsed ? "visible" : "hidden")};
  user-select: none;
  cursor: pointer;
  width: 24px;
  height: 24px;

  svg {
    ${props => props.collapsed && "transform: rotate(-90deg);"};
    fill: ${props =>
      props.collapsed ? props.theme.text : props.theme.placeholder};
    transition: transform 100ms ease-in-out;
  }

  &:hover {
    svg {
      fill: ${props => props.theme.text};
    }
  }
`;

const Wrapper = styled.div`
  display: inline;
  margin-left: ${(props: Props) => (props.hasPretitle ? "-1.2em" : 0)};
`;

const HiddenAnchor = styled.a`
  visibility: hidden;
  display: block;
  position: relative;
  top: -50px;
`;

const Anchor = styled(CopyToClipboard)`
  visibility: hidden;
  padding-left: 0.25em;
`;

export const StyledHeading = styled(Heading)`
  display: flex;
  align-items: center;
  position: relative;
  margin-left: -24px;

  &:hover {
    ${CollapseToggle} {
      visibility: visible;
    }

    ${Anchor} {
      color: ${props => props.theme.placeholder};
      visibility: visible;
      text-decoration: none;
      cursor: pointer;

      &:hover {
        color: ${props => props.theme.text};
      }
    }
  }
`;
export const Heading1 = (props: SlateNodeProps) => (
  <StyledHeading component="h1" {...props} />
);
export const Heading2 = (props: SlateNodeProps) => (
  <StyledHeading component="h2" {...props} />
);
export const Heading3 = (props: SlateNodeProps) => (
  <StyledHeading component="h3" {...props} />
);
export const Heading4 = (props: SlateNodeProps) => (
  <StyledHeading component="h4" {...props} />
);
export const Heading5 = (props: SlateNodeProps) => (
  <StyledHeading component="h5" {...props} />
);
export const Heading6 = (props: SlateNodeProps) => (
  <StyledHeading component="h6" {...props} />
);
