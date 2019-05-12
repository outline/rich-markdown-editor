// @flow
import * as React from "react";
import styled from "styled-components";

type Props = {};

type State = { shadowLeft: boolean, shadowRight: boolean };

class Scrollable extends React.Component<Props, State> {
  element: ?HTMLElement;

  state = {
    shadowLeft: false,
    shadowRight: false,
  };

  componentDidMount() {
    const shadowRight = !!(
      this.element && this.element.scrollWidth > this.element.clientWidth
    );

    if (this.state.shadowRight !== shadowRight) {
      this.setState({ shadowRight });
    }
  }

  handleScroll = (ev: SyntheticMouseEvent<*>) => {
    const shadowLeft = ev.currentTarget.scrollLeft > 0;

    if (this.state.shadowLeft !== shadowLeft) {
      this.setState({ shadowLeft });
    }
  };

  render() {
    return (
      <Shadows
        ref={ref => (this.element = ref)}
        onScroll={this.handleScroll}
        shadowLeft={this.state.shadowLeft}
        shadowRight={this.state.shadowRight}
        {...this.props}
      />
    );
  }
}

const Shadows = styled.div`
  overflow-y: hidden;
  overflow-x: scroll;
  padding-left: 1em;
  border-left: 1px solid transparent;
  border-right: 1px solid transparent;
  transition: border 250ms ease-in-out;
  margin-left: -1em;

  ${props =>
    props.shadowLeft && `border-left: 1px solid ${props.theme.tableDivider};`}
  ${props =>
    props.shadowRight && `border-right: 1px solid ${props.theme.tableDivider};`}
`;

export default Scrollable;
