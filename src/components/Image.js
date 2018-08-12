// @flow
import * as React from "react";
import ImageZoom from "react-medium-image-zoom";
import styled from "react-emotion";
import type { SlateNodeProps as Props } from "../types";

type State = {
  hasError?: boolean,
};
class Image extends React.Component<Props, State> {
  state = {
    hasError: false,
  };

  handleChange = (ev: SyntheticInputEvent<*>) => {
    const alt = ev.target.value;
    const { editor, node } = this.props;
    const data = node.data.toObject();

    editor.change(change =>
      change.setNodeByKey(node.key, { data: { ...data, alt } })
    );
  };

  handleClick = (ev: SyntheticInputEvent<*>) => {
    ev.stopPropagation();
  };

  handleError = () => {
    this.setState({ hasError: true });
  };

  render() {
    const { attributes, editor, node, readOnly } = this.props;
    const loading = node.data.get("loading");
    const caption = node.data.get("alt") || "";
    const src = node.data.get("src");
    const error = node.data.get("error");
    const active =
      editor.value.isFocused && editor.value.selection.hasEdgeIn(node);
    const showCaption = !readOnly || caption;

    return (
      <CenteredImage contentEditable={false}>
        {this.state.hasError ? (
          <React.Fragment>
            <StyledImg width={200} height={100} active={active} />
            <Error>Could not load image.</Error>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <HiddenImg src={src} onError={this.handleError} />
            {!readOnly ? (
              <StyledImg
                {...attributes}
                src={src}
                alt={caption}
                active={active}
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
                onChange={this.handleChange}
                onClick={this.handleClick}
                defaultValue={caption}
                contentEditable={false}
                disabled={readOnly}
                tabIndex={-1}
              />
            )}
            {error && (
              <Error>Sorry, an error occurred uploading the image.</Error>
            )}
          </React.Fragment>
        )}
      </CenteredImage>
    );
  }
}

const HiddenImg = styled.img`
  display: none;
`;

const Error = styled.div`
  position: absolute;
  text-align: center;
  transform: translate3d(-50%, -50%, 0);
  top: 50%;
  left: 50%;

  background: rgba(255, 255, 255, 0.5);
  display: block;
  margin: 0 auto;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
`;

const StyledImg = styled.img`
  max-width: 100%;
  box-shadow: ${props =>
    props.active ? `0 0 0 2px ${props.theme.selected}` : "none"};
  border-radius: ${props => (props.active ? `2px` : "0")};
  opacity: ${props => (props.loading ? 0.5 : 1)};
`;

const CenteredImage = styled.span`
  display: block;
  text-align: center;
  position: relative;
`;

const Caption = styled.input`
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

  &::placeholder {
    color: ${props => props.theme.placeholder};
  }
`;

export default Image;
