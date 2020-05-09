import styled from "styled-components";

type Props = { active?: boolean; disabled?: boolean };

export default styled.button<Props>`
  display: inline-block;
  flex: 0;
  width: 24px;
  height: 24px;
  cursor: pointer;
  margin-left: 10px;
  border: none;
  background: none;
  transition: opacity 100ms ease-in-out;
  padding: 0;
  opacity: 0.7;
  outline: none;

  &:first-child {
    margin-left: 0;
  }

  &:hover {
    opacity: 1;
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }

  ${props => props.active && "opacity: 1;"};
`;
