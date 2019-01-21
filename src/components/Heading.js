// @flow
import * as React from "react";
import styled from "styled-components";
import { CollapsedIcon } from "outline-icons";
import type { SlateNodeProps } from "../types";
import headingToSlug from "../lib/headingToSlug";
import CopyToClipboard from "./CopyToClipboard";

type Props = SlateNodeProps & {
  component: string,
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

  const collapsed = node.data.get("collapsed");
  const slugish = headingToSlug(editor.value.document, node);
  const showHash = readOnly && !!slugish;
  const Component = component;
  const pretitle = editor.props.pretitle || "";
  const title = node.text.trim();
  const startsWithPretitleAndSpace =
    pretitle && title.match(new RegExp(`^${pretitle}\\s`));
  const pathToHeading = `${window.location.pathname}#${slugish}`;

  return (
    <Component {...attributes} className={className}>
      <HiddenAnchor id={slugish} />
      <CollapseToggle
        onClick={() => editor.toggleContentBelow(node)}
        contentEditable={false}
        collapsed={collapsed}
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
  visibility: ${props => (props.collapsed ? "visible" : "hidden")};
  user-select: none;
  position: absolute;
  left: -24px;

  svg {
    ${props => props.collapsed && "transform: rotate(-90deg);"};
    fill: ${props => props.theme.text};
    transition: transform 100ms ease-in-out;
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
  position: relative;

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
