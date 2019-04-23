// @flow
import * as React from "react";
import styled from "styled-components";
import CopyToClipboard from "./CopyToClipboard";

type State = {
  copied: boolean,
};

class CopyButton extends React.Component<*, State> {
  copiedTimeout: ?TimeoutID;
  state = { copied: false };

  componentWillUnmount() {
    if (this.copiedTimeout) clearTimeout(this.copiedTimeout);
  }

  handleCopy = () => {
    this.setState({ copied: true });
    this.copiedTimeout = setTimeout(
      () => this.setState({ copied: false }),
      3000
    );
  };

  render() {
    return (
      <StyledCopyToClipboard onCopy={this.handleCopy} {...this.props}>
        <span>{this.state.copied ? "Copied" : "Copy"}</span>
      </StyledCopyToClipboard>
    );
  }
}

const StyledCopyToClipboard = styled(CopyToClipboard)`
  position: absolute;
  top: 0;
  right: 0;

  opacity: 0;
  transition: opacity 50ms ease-in-out;
  z-index: 1;
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.theme.text};
  background: ${props => props.theme.codeBorder};
  border-radius: 0 4px 0 0;
  padding: 2px 6px;
  cursor: pointer;
`;

export default CopyButton;
