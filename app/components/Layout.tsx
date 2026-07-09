import { AnimatePresence } from "framer-motion";
import { observer } from "mobx-react";
import * as React from "react";
import { Helmet } from "react-helmet-async";
import type { DefaultTheme } from "styled-components";
import styled from "styled-components";
import breakpoint from "styled-components-breakpoint";
import { s } from "@shared/styles";
import Flex from "~/components/Flex";
import { LoadingIndicatorBar } from "~/components/LoadingIndicator";
import { useRightSidebarContent } from "~/components/RightSidebarContext";
import SkipNavContent from "~/components/SkipNavContent";
import SkipNavLink from "~/components/SkipNavLink";
import env from "~/env";
import useStores from "~/hooks/useStores";

type Props = {
  /** Main content to render in the layout. */
  children?: React.ReactNode;
  /** Page title to display in the browser tab. Defaults to app name if not provided. */
  title?: string;
  /** Left sidebar content. */
  sidebar?: React.ReactNode;
  /** Whether the sidebar can be collapsed, defaults to true. */
  sidebarCanCollapse?: boolean;
};

const Layout = React.forwardRef(function Layout_(
  { title, children, sidebar, sidebarCanCollapse = true }: Props,
  ref: React.RefObject<HTMLDivElement>
) {
  const { ui } = useStores();
  const sidebarCollapsed =
    !sidebar || (ui.sidebarIsClosed && sidebarCanCollapse);
  const sidebarRight = useRightSidebarContent();

  return (
    <Container column auto ref={ref}>
      <Helmet>
        <title>{title ? title : env.APP_NAME}</title>
      </Helmet>

      <SkipNavLink />

      {ui.progressBarVisible && <LoadingIndicatorBar />}

      <Container auto>
        {sidebar}

        <SkipNavContent />
        <Content
          auto
          justify="center"
          role="main"
          $isResizing={ui.sidebarIsResizing}
          $sidebarCollapsed={sidebarCollapsed}
          $sidebarExpanded={!!sidebar && !sidebarCollapsed}
          $hasSidebar={!!sidebar}
          style={
            sidebarCollapsed
              ? undefined
              : {
                  marginInlineStart: `calc(${ui.sidebarWidth}px + 12px)`,
                }
          }
        >
          {children}
        </Content>

        <AnimatePresence initial={false}>{sidebarRight}</AnimatePresence>
      </Container>
    </Container>
  );
});

/**
 * Three-tier responsive shell contract (Phase 1):
 *   - `< desktop` (< 1025px): both rails collapse — the left sidebar becomes a
 *     mobile drawer and the context inspector flows below the canvas.
 *   - `desktop … desktopLarge` (1025–1599px): two columns — floating left
 *     sidebar + full-width canvas; the inspector rail stays collapsed.
 *   - `>= desktopLarge` (1600px): three columns — ~260px sidebar, `1fr` canvas,
 *     and a 280px context inspector.
 *
 * The left sidebar is `position: fixed` and the canvas offsets via margin, so
 * the columns are expressed with margins + a shared width token rather than a
 * literal CSS grid (a grid track cannot host a fixed-positioned child, and a
 * grid rewrite here would remount the shell). Scenes read
 * `--inspector-rail-width` to reserve the third column.
 */
const Container = styled(Flex)`
  --inspector-rail-width: 0px;

  background: ${s("background")};
  position: relative;
  width: 100%;
  min-height: 100%;

  ${breakpoint("desktopLarge")`
    --inspector-rail-width: 280px;
  `};
`;

type ContentProps = {
  $isResizing?: boolean;
  $sidebarCollapsed?: boolean;
  $sidebarExpanded?: boolean;
  $hasSidebar?: boolean;
  theme: DefaultTheme;
};

const Content = styled(Flex)<ContentProps>`
  margin: 0;
  transition: ${(props) =>
    props.$isResizing
      ? "none"
      : `margin-inline-start var(--duration-slow) var(--ease-out), transform var(--duration-slow) var(--ease-out)`};

  @media print {
    margin: 0 !important;
  }

  ${breakpoint("mobile", "tablet")`
    margin-inline-start: 0 !important;
  `}

  /* Floating sidebar: include the 12px left margin so content sits clear of the
     collapsed pill (sidebarCollapsedWidth + 12px floating gutter). */
  ${breakpoint("tablet")`
    ${(props: ContentProps) =>
      props.$hasSidebar &&
      props.$sidebarCollapsed &&
      `margin-inline-start: calc(${props.theme.sidebarCollapsedWidth}px + 12px);`}

    ${(props: ContentProps) =>
      props.$hasSidebar &&
      props.$sidebarExpanded &&
      "transform: translateX(18px);"}

    [dir="rtl"] & {
      ${(props: ContentProps) =>
        props.$hasSidebar &&
        props.$sidebarExpanded &&
        "transform: translateX(-18px);"}
    }
  `};
`;

export default observer(Layout);
