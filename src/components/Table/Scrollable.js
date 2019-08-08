// @flow
import * as React from "react";
import styled from "styled-components";

type Props = { children: React.Node };

type State = {
  shadowLeft: boolean,
  shadowRight: boolean,
};

class Scrollable extends React.Component<Props, State> {
  element: ?HTMLElement;

  state = {
    shadowLeft: false,
    shadowRight: false,
  };

  componentDidMount() {
    this.updateRightShadow();
  }

  componentDidUpdate() {
    this.updateRightShadow();
  }

  updateRightShadow() {
    const shadowRight = !!(
      this.element && this.element.scrollWidth > this.element.clientWidth
    );

    if (this.state.shadowRight !== shadowRight) {
      this.setState({ shadowRight });
    }
  }

  handleScroll = (ev: SyntheticMouseEvent<HTMLElement>) => {
    const shadowLeft = ev.currentTarget.scrollLeft > 0;

    if (this.state.shadowLeft !== shadowLeft) {
      this.setState({ shadowLeft });
    }
  };

  render() {
    const { children, ...rest } = this.props;
    return (
      <Wrapper>
        <Scrolling
          ref={ref => (this.element = ref)}
          onScroll={this.handleScroll}
          {...rest}
        >
          {children}
        </Scrolling>
        <Shadow left={this.state.shadowLeft} />
        <Shadow right={this.state.shadowRight} />
      </Wrapper>
    );
  }
}

const Wrapper = styled.div`
  position: relative;
  margin: 0.5em 0;
`;

const Scrolling = styled.div`
  overflow-y: hidden;
  overflow-x: scroll;
  padding-left: 1em;
  border-left: 1px solid transparent;
  border-right: 1px solid transparent;
  transition: border 250ms ease-in-out;
  margin-left: -1em;
`;

const Shadow = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: -1em;
  width: 16px;
  transition: box-shadow 250ms ease-in-out;
  border: 0px solid transparent;
  border-left-width: 1em;
  pointer-events: none;

  ${props =>
    props.left &&
    `
     box-shadow: 16px 0 16px -16px inset rgba(0,0,0,0.25);
     border-left: 1em solid ${props.theme.background};
  `}

  ${props =>
    props.right &&
    `right: 0;
     left: auto;
     box-shadow: -16px 0 16px -16px inset rgba(0,0,0,0.25);
  `}
`;

export default Scrollable;
