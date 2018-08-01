// @flow
import * as React from "react";
import styled from "react-emotion";
import { Document } from "slate";
import type { SlateNodeProps } from "../types";
import headingToSlug from "../lib/headingToSlug";
import Placeholder from "./Placeholder";

type Props = SlateNodeProps & {
  component: string,
  className: string,
  placeholder: string,
  hasPretitle: boolean,
};

function Heading(props: Props) {
  const {
    parent,
    placeholder,
    node,
    editor,
    readOnly,
    children,
    component = "h1",
    className,
    attributes,
  } = props;
  const parentIsDocument = parent instanceof Document;
  const firstHeading = parentIsDocument && parent.nodes.first() === node;
  const showPlaceholder = placeholder && firstHeading && !node.text;
  const slugish = headingToSlug(editor.value.document, node);
  const showHash = readOnly && !!slugish;
  const Component = component;
  const pretitle = editor.props.pretitle || "";
  const title = node.text.trim();
  const startsWithPretitleAndSpace =
    pretitle && title.match(new RegExp(`^${pretitle}\\s`));

  return (
    <Component {...attributes} id={slugish} className={className}>
      <Wrapper hasPretitle={startsWithPretitleAndSpace}>{children}</Wrapper>
      {showPlaceholder && (
        <Placeholder contentEditable={false}>
          {editor.props.titlePlaceholder}
        </Placeholder>
      )}
      {showHash && (
        <Anchor name={slugish} href={`#${slugish}`}>
          #
        </Anchor>
      )}
    </Component>
  );
}

const Wrapper = styled.div`
  display: inline;
  margin-left: ${(props: Props) => (props.hasPretitle ? "-1.2em" : 0)};
`;

const Anchor = styled.a`
  visibility: hidden;
  padding-left: 0.25em;
`;

export const StyledHeading = styled(Heading)`
  position: relative;

  &:hover {
    ${Anchor} {
      color: ${props => props.theme.textSecondary};
      visibility: visible;
      text-decoration: none;

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
