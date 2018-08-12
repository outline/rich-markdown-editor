// @flow
import * as React from "react";
import styled from "react-emotion";
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
        <span>{this.state.copied ? "Copied!" : "Copy"}</span>
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
  color: ${props => props.theme.textLight};
  background: ${props => props.theme.primary};
  border-radius: 0 4px 0 4px;
  padding: 1px 8px;
  cursor: pointer;
`;

export default CopyButton;
