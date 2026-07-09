import * as React from "react";
import { m } from "framer-motion";
import styled from "styled-components";
import useMediaQuery from "~/hooks/useMediaQuery";
import useMobile from "~/hooks/useMobile";
import useEntranceAnimation from "~/hooks/useEntranceAnimation";
import ScrollContext from "./ScrollContext";

type Props = {
  children: React.ReactNode;
};

const StableWrapper = styled.div<{ $shouldApplyMobileStyles: boolean }>`
  ${({ $shouldApplyMobileStyles }) =>
    $shouldApplyMobileStyles
      ? `
        width: 100vw;
        height: 100vh;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
      `
      : `
        display: contents;
      `}
`;

/**
 * Inner motion wrapper that hosts the page-load entrance animation. On
 * desktop this becomes the visible layout box because the StableWrapper
 * above uses `display: contents` — so the animation has a real box to
 * render the blur / opacity / translate against without disturbing the
 * surrounding flex geometry (its box-rendering parent is #root).
 *
 * This animation only runs while the application mounts. Route changes must
 * never animate this wrapper: it contains the whole app shell and replaying
 * it makes document navigation look like a full page refresh.
 */
const PageEnter = styled(m.div)`
  @media (prefers-reduced-motion: no-preference) {
    will-change: opacity, transform, filter;
  }
`;

const PageScroll = ({ children }: Props) => {
  const isMobile = useMobile();
  const isPrinting = useMediaQuery("print");
  const ref = React.useRef<HTMLDivElement>(null);

  // The entrance animation must play exactly once, when the app shell first
  // mounts. PageScroll lives above the router, so it is not remounted on
  // navigation — but we still gate the animation on a first-mount ref so that
  // an unrelated re-render (media-query / mobile-style change) can never replay
  // the reveal and make navigation look like a full page refresh.
  const hasEntered = React.useRef(false);
  const entrance = useEntranceAnimation({ disabled: hasEntered.current });
  React.useEffect(() => {
    hasEntered.current = true;
  }, []);

  const shouldApplyMobileStyles = isMobile && !isPrinting;

  return (
    <ScrollContext.Provider value={shouldApplyMobileStyles ? ref : undefined}>
      <StableWrapper
        ref={ref}
        $shouldApplyMobileStyles={shouldApplyMobileStyles}
      >
        <PageEnter {...entrance}>{children}</PageEnter>
      </StableWrapper>
    </ScrollContext.Provider>
  );
};

export default PageScroll;
