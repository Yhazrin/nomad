import * as React from "react";
import { useLocation } from "react-router-dom";
import { m, useAnimationControls } from "framer-motion";
import styled from "styled-components";
import useMediaQuery from "~/hooks/useMediaQuery";
import useMobile from "~/hooks/useMobile";
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
 * IMPORTANT: do NOT key this element on the route pathname. Doing so would
 * unmount/remount the entire subtree on every navigation, throwing away
 * local state, re-running every effect, and feeling like a full page
 * refresh. Instead we drive the entrance via useAnimationControls so the
 * tree persists and only the wrapper's transform/opacity/filter change.
 */
const PageEnter = styled(m.div)`
  @media (prefers-reduced-motion: no-preference) {
    will-change: opacity, transform, filter;
  }
`;

/** Apple-style spring entrance: gentle, slightly delayed so it lands
 *  after route-level chrome has settled. */
const ENTER_INITIAL = { opacity: 0, y: 16, filter: "blur(8px)" };
const ENTER_ANIMATE = { opacity: 1, y: 0, filter: "blur(0px)" };
const ENTER_TRANSITION = {
  type: "spring",
  stiffness: 100,
  damping: 20,
} as const;

const PageScroll = ({ children }: Props) => {
  const isMobile = useMobile();
  const isPrinting = useMediaQuery("print");
  const ref = React.useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Stable animation controls — driving the wrapper directly avoids React
  // keying/remount churn and keeps the subtree intact across navigations.
  const controls = useAnimationControls();
  // Track which pathname the latest animation was for so we don't replay
  // during StrictMode's intentional double-invocation.
  const lastAnimatedFor = React.useRef<string | null>(null);

  const shouldApplyMobileStyles = isMobile && !isPrinting;

  React.useEffect(() => {
    if (lastAnimatedFor.current === location.pathname) {
      return;
    }
    lastAnimatedFor.current = location.pathname;
    // Reduced-motion: snap to the visible state with no animation.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      void controls.set(ENTER_ANIMATE);
      return;
    }
    void controls.set(ENTER_INITIAL);
    void controls.start(ENTER_ANIMATE, ENTER_TRANSITION);
  }, [location.pathname, controls]);

  return (
    <ScrollContext.Provider value={shouldApplyMobileStyles ? ref : undefined}>
      <StableWrapper
        ref={ref}
        $shouldApplyMobileStyles={shouldApplyMobileStyles}
      >
        <PageEnter animate={controls}>{children}</PageEnter>
      </StableWrapper>
    </ScrollContext.Provider>
  );
};

export default PageScroll;
