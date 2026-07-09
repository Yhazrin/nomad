import { keyframes } from "styled-components";
import type { Location } from "history";
import styled from "styled-components";
import CenteredContent from "~/components/CenteredContent";
import PageTitle from "~/components/PageTitle";
import Container from "./Container";

type Props = {
  location: Location<{ title?: string }>;
};

/**
 * Apple-style loading state for the document scene. Each placeholder bar
 * uses a sliding linear gradient to suggest progress without resorting to
 * the heavier pulsating opacity animation.
 */
export default function Loading({ location }: Props) {
  return (
    <Container column auto>
      {location.state?.title && <PageTitle title={location.state.title} />}
      <CenteredContent>
        <Skeleton>
          <Block $height={34} $maxWidth={70} />
          <Block $height={34} $maxWidth={40} $delay={0.1} />
          <Spacer />
          <Block $maxWidth={100} $delay={0.2} />
          <Block $maxWidth={92} $delay={0.3} />
          <Block $maxWidth={86} $delay={0.4} />
        </Skeleton>
      </CenteredContent>
    </Container>
  );
}

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const Skeleton = styled.div`
  display: block;
  margin: 6vh 0;
  padding: 12px 0;
`;

const Block = styled.div<{
  $height?: number;
  $maxWidth?: number;
  $delay?: number;
}>`
  width: ${(props) => (props.$maxWidth ? `${props.$maxWidth}%` : "100%")};
  height: ${(props) => props.$height ?? 18}px;
  margin-bottom: 10px;
  border-radius: var(--radius-sm);
  background: linear-gradient(
    90deg,
    ${(props) => props.theme.divider} 0%,
    ${(props) => props.theme.backgroundSecondary} 50%,
    ${(props) => props.theme.divider} 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s linear infinite;
  animation-delay: ${(props) => props.$delay ?? 0}s;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Spacer = styled.div`
  height: 12px;
`;
