import styled from "styled-components";

const Separator = styled.div`
  height: 100%;
  width: 1px;
  background: ${props => props.theme.toolbarItem};
  opacity: 0.2;
  display: inline-block;
  margin-left: 10px;
`;

export default Separator;
