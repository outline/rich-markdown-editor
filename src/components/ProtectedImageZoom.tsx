import * as React from "react";
import { omit } from "lodash";
import ImageZoom, { ImageZoomProps } from "react-medium-image-zoom";

import fetchProtectedFile from "../lib/fetchProtectedFile";

interface IState {
  imageUrl: string;
}

interface IProps {
  title: string;
}

export class ProtectedImageZoom extends React.Component<
  IProps & ImageZoomProps,
  IState
> {
  constructor(props) {
    super(props);

    this.state = {
      imageUrl: "",
    };
  }

  async componentDidMount(): Promise<void> {
    const imageBlob = await fetchProtectedFile(this.props.image.src);

    const imageUrl = URL.createObjectURL(imageBlob);

    this.setState({
      imageUrl,
    });

    return Promise.resolve();
  }

  render(): JSX.Element {
    const { image, title } = this.props;
    const { imageUrl } = this.state;
    const omittedProps = omit(this.props, "image");

    return (
      <ImageZoom
        image={{
          src: imageUrl,
          alt: image.alt,
          className: image.className,
          style: image.style,
          title: title,
          onload: () => URL.revokeObjectURL(imageUrl),
        }}
        {...omittedProps}
      />
    );
  }
}
