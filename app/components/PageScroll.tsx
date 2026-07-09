import * as React from "react";
import { useLocation } from "react-router-dom";
import { m } from "framer-motion";
import styled from "styled-components";
import useMediaQuery from "~/hooks/useMediaQuery";
import useMobile from "~/hooks/useMobile";
import { useEntranceAnimation } from "~/hooks/useEntranceAnimation";
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
 */
const PageEnter = styled(m.div)`
  @media (prefers-reduced-motion: no-preference) {
    will-change: opacity, transform, filter;
  }
`;

/**
 * A component that wraps its children in a scrollable container on mobile devices.
 * This allows us to place a fixed toolbar at the bottom of the page in the document
 * editor, which would otherwise be obscured by the on-screen keyboard.
 *
 * On desktop devices, the children are rendered directly without any wrapping.
 *
 * The children are also wrapped in a motion.div that runs an Apple-style
 * fade-up entrance on mount and re-runs the animation whenever the route
 * pathname changes.
 */
const PageScroll = ({ children }: Props) => {
  const isMobile = useMobile();
  const isPrinting = useMediaQuery("print");
  const ref = React.useRef<HTMLDivElement>(null);
  const location = useLocation();
  const entrance = useEntranceAnimation();

  const shouldApplyMobileStyles = isMobile && !isPrinting;

  return (
    <ScrollContext.Provider value={shouldApplyMobileStyles ? ref : undefined}>
      <StableWrapper
        ref={ref}
        $shouldApplyMobileStyles={shouldApplyMobileStyles}
      >
        <PageEnter key={location.pathname} {...entrance}>
          {children}
        </PageEnter>
      </StableWrapper>
    </ScrollContext.Provider>
  );
};

export default PageScroll;
