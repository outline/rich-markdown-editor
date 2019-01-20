// @flow
import * as React from "react";
import ImageZoom from "react-medium-image-zoom";
import TextareaAutosize from "react-autosize-textarea";
import styled from "styled-components";
import type { SlateNodeProps as Props } from "../types";

type State = {
  hasError?: boolean,
};
class Image extends React.Component<Props, State> {
  state = {
    hasError: false,
  };

  handleKeyDown = (ev: SyntheticKeyboardEvent<*>) => {
    if (ev.key === "Enter" || ev.key === "ArrowDown") {
      ev.preventDefault();
      const { editor, node } = this.props;
      return editor
        .moveToRangeOfNode(node)
        .moveToStartOfNextBlock()
        .focus();
    }
  };

  handleChange = (ev: SyntheticInputEvent<*>) => {
    ev.stopPropagation();
    const alt = ev.target.value;
    const { editor, node } = this.props;
    const data = node.data.toObject();

    editor.setNodeByKey(node.key, { data: { ...data, alt } });
  };

  handleClick = (ev: SyntheticInputEvent<*>) => {
    ev.stopPropagation();
  };

  handleError = () => {
    this.setState({ hasError: true });
  };

  render() {
    const { attributes, node, isSelected, readOnly } = this.props;
    const loading = node.data.get("loading");
    const caption = node.data.get("alt") || "";
    const src = node.data.get("src");
    const showCaption = !readOnly || caption;

    return (
      <CenteredImage contentEditable={false}>
        {this.state.hasError ? (
          <React.Fragment>
            <ErrorImg as="div" isSelected={isSelected} />
            <ErrorMessage>Could not load image</ErrorMessage>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <HiddenImg src={src} onError={this.handleError} />
            {!readOnly ? (
              <StyledImg
                {...attributes}
                src={src}
                alt={caption}
                isSelected={isSelected}
                loading={loading}
              />
            ) : (
              <ImageZoom
                image={{
                  src,
                  alt: caption,
                  style: {
                    maxWidth: "100%",
                  },
                  ...attributes,
                }}
                shouldRespectMaxDimension
              />
            )}
            {showCaption && (
              <Caption
                type="text"
                placeholder="Write a caption"
                onKeyDown={this.handleKeyDown}
                onChange={this.handleChange}
                onClick={this.handleClick}
                defaultValue={caption}
                contentEditable={false}
                disabled={readOnly}
                tabIndex={-1}
                async
              />
            )}
          </React.Fragment>
        )}
      </CenteredImage>
    );
  }
}

const ErrorMessage = styled.div`
  position: absolute;
  text-align: center;
  transform: translate3d(-50%, -50%, 0);
  top: 50%;
  left: 50%;

  color: ${props => props.theme.text};
  background: ${props => props.theme.imageErrorBackground};
  display: block;
  margin: 0 auto;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
`;

const HiddenImg = styled.img`
  display: none;
`;

const StyledImg = styled.img`
  max-width: 100%;
  box-shadow: ${props =>
    props.isSelected ? `0 0 0 2px ${props.theme.selected}` : "none"};
  border-radius: ${props => (props.isSelected ? `2px` : "0")};
  opacity: ${props => (props.loading ? 0.5 : 1)};
`;

const ErrorImg = styled(StyledImg)`
  width: 200px;
  height: 100px;
  margin: 0 auto;
`;

const CenteredImage = styled.span`
  display: block;
  text-align: center;
  position: relative;
`;

const Caption = styled(TextareaAutosize)`
  border: 0;
  display: block;
  font-size: 13px;
  font-style: italic;
  color: ${props => props.theme.textSecondary};
  padding: 2px 0;
  line-height: 16px;
  text-align: center;
  width: 100%;
  outline: none;
  background: none;
  resize: none;

  &::placeholder {
    color: ${props => props.theme.placeholder};
  }
`;

export default Image;
