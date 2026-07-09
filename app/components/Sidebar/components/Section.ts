import styled from "styled-components";
import Flex from "~/components/Flex";

const Section = styled(Flex)`
  position: relative;
  flex-direction: column;
  /* Floating sidebar: trim the gutter since the panel itself floats. */
  margin: 0 6px 10px;
  min-width: ${(props) => props.theme.sidebarMinWidth}px;
  flex-shrink: 0;

  &:first-child {
    margin-top: 8px;
  }

  &:last-child {
    margin-bottom: 12px;
  }

  &:empty {
    display: none;
  }
`;

export default Section;
