import { observer } from "mobx-react";
import * as React from "react";
import { mergeRefs } from "react-merge-refs";
import { useWebHaptics } from "web-haptics/react";
import { useLocation } from "react-router-dom";
import { SidebarIcon } from "outline-icons";
import styled, { useTheme } from "styled-components";
import breakpoint from "styled-components-breakpoint";
import { depths, s } from "@shared/styles";
import { Avatar } from "~/components/Avatar";
import Flex from "~/components/Flex";
import useCurrentUser from "~/hooks/useCurrentUser";
import useMobile from "~/hooks/useMobile";
import usePrevious from "~/hooks/usePrevious";
import useStores from "~/hooks/useStores";
import AccountMenu from "~/menus/AccountMenu";
import { fadeOnDesktopBackgrounded } from "~/styles";
import { fadeIn } from "~/styles/animations";
import NotificationIcon from "../Notifications/NotificationIcon";
import NotificationsPopover from "../Notifications/NotificationsPopover";
import { TooltipProvider } from "../TooltipContext";
import ResizeBorder from "./components/ResizeBorder";
import SidebarButton from "./components/SidebarButton";
import ToggleButton from "./components/ToggleButton";
import { useTranslation } from "react-i18next";
import { useDirection } from "@radix-ui/react-direction";

const ANIMATION_MS = 250;

type Props = {
  /** Whether to hide the sidebar content (sets opacity to 0). */
  hidden?: boolean;
  /** Whether the sidebar can be collapsed, defaults to true. */
  canCollapse?: boolean;
  /** CSS class name(s) to apply to the sidebar container. */
  className?: string;
  /** Content to render inside the sidebar. */
  children: React.ReactNode;
};

const Sidebar = React.forwardRef<HTMLDivElement, Props>(function Sidebar_(
  { children, hidden = false, canCollapse = true, className }: Props,
  ref: React.RefObject<HTMLDivElement>
) {
  const [isCollapsing, setCollapsing] = React.useState(false);
  const { t } = useTranslation();
  const theme = useTheme();
  const { ui } = useStores();
  const location = useLocation();
  const previousLocation = usePrevious(location);
  const user = useCurrentUser({ rejectOnEmpty: false });
  const isMobile = useMobile();
  const width = ui.sidebarWidth;
  // A compact rail is used on desktop. On mobile the sidebar remains a
  // full-width drawer even if the desktop preference is set to collapsed.
  const collapsed = !isMobile && ui.sidebarIsClosed && canCollapse;
  const maxWidth = theme.sidebarMaxWidth;
  const minWidth = theme.sidebarMinWidth + 16; // padding
  const { trigger } = useWebHaptics();
  const direction = useDirection();

  const [offset, setOffset] = React.useState(0);
  const [isAnimating, setAnimating] = React.useState(false);
  const [isResizing, setResizing] = React.useState(false);
  const isSmallerThanMinimum = width < minWidth;
  const internalRef = React.useRef<HTMLDivElement | null>(null);
  const mergedRef = React.useMemo(() => mergeRefs([internalRef, ref]), [ref]);

  const handleDrag = React.useCallback(
    (event: MouseEvent) => {
      // suppresses text selection
      event.preventDefault();
      const rawWidth =
        direction === "rtl" ? offset - event.pageX : event.pageX - offset;
      const newWidth = Math.min(rawWidth, maxWidth);
      const isSmallerThanCollapsePoint = newWidth < minWidth / 2;

      if (canCollapse) {
        ui.set({
          sidebarWidth: isSmallerThanCollapsePoint
            ? theme.sidebarCollapsedWidth
            : newWidth,
        });
      } else {
        ui.set({ sidebarWidth: Math.max(newWidth, minWidth) });
      }
    },
    [ui, theme, offset, minWidth, maxWidth, direction, canCollapse]
  );

  const handleStopDrag = React.useCallback(() => {
    setResizing(false);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (isSmallerThanMinimum) {
      const isSmallerThanCollapsePoint = width < minWidth / 2;

      if (isSmallerThanCollapsePoint && canCollapse) {
        setAnimating(false);
        setCollapsing(true);
        ui.collapseSidebar();
      } else {
        ui.set({ sidebarWidth: minWidth });
        setAnimating(true);
      }
    } else {
      ui.set({ sidebarWidth: width });
    }
  }, [ui, isSmallerThanMinimum, minWidth, width, canCollapse]);

  const handleMouseDown = React.useCallback(
    (event) => {
      event.preventDefault();
      if (!document.hasFocus()) {
        return;
      }

      setOffset(
        direction === "rtl" ? event.pageX + width : event.pageX - width
      );
      setResizing(true);
      setAnimating(false);
    },
    [width, direction]
  );

  React.useEffect(() => {
    if (isAnimating) {
      setTimeout(() => setAnimating(false), ANIMATION_MS);
    }
  }, [isAnimating]);

  React.useEffect(() => {
    if (isCollapsing) {
      setTimeout(() => {
        ui.set({ sidebarWidth: minWidth });
        setCollapsing(false);
      }, ANIMATION_MS);
    }
  }, [ui, minWidth, isCollapsing]);

  React.useEffect(() => {
    if (isResizing) {
      document.body.style.cursor = "col-resize";
      document.addEventListener("mousemove", handleDrag);
      document.addEventListener("mouseup", handleStopDrag);
    } else {
      document.body.style.cursor = "initial";
    }

    return () => {
      document.removeEventListener("mousemove", handleDrag);
      document.removeEventListener("mouseup", handleStopDrag);
    };
  }, [isResizing, handleDrag, handleStopDrag]);

  const handleReset = React.useCallback(() => {
    ui.set({ sidebarWidth: theme.sidebarWidth });
  }, [ui, theme.sidebarWidth]);

  React.useEffect(() => {
    ui.setSidebarResizing(isResizing);
  }, [ui, isResizing]);

  React.useEffect(() => {
    if (location !== previousLocation) {
      ui.hideMobileSidebar();
    }
  }, [ui, location, previousLocation]);

  const style = React.useMemo(
    () => ({
      width: `${collapsed ? theme.sidebarCollapsedWidth : width}px`,
    }),
    [collapsed, theme.sidebarCollapsedWidth, width]
  );

  const handleCloseSidebar = () => {
    void trigger("light");
    ui.toggleMobileSidebar();
  };

  const handleExpandSidebar = () => {
    void trigger("light");
    ui.expandSidebar();
  };

  return (
    <TooltipProvider>
      <Container
        id="sidebar"
        ref={mergedRef}
        style={style}
        $hidden={hidden}
        $isAnimating={isAnimating}
        $mobileSidebarVisible={ui.mobileSidebarVisible}
        $collapsed={collapsed}
        $isMobile={isMobile}
        className={className}
        column
      >
        {collapsed && (
          <CollapsedToggle
            type="button"
            aria-label={t("Expand sidebar")}
            onClick={handleExpandSidebar}
          >
            <SidebarIcon />
          </CollapsedToggle>
        )}
        {children}

        {user && (
          <AccountMenu>
            <SidebarButton
              showMoreMenu
              title={user.name}
              position="bottom"
              image={
                <Avatar
                  alt={t("Avatar of {{ name }}", { name: user.name })}
                  model={user}
                  size={24}
                />
              }
            >
              <NotificationsPopover>
                <SidebarButton
                  position="bottom"
                  image={<NotificationIcon />}
                  aria-label={t("Notifications")}
                  style={{ paddingInline: 4 }}
                />
              </NotificationsPopover>
            </SidebarButton>
          </AccountMenu>
        )}
        <ResizeBorder
          onMouseDown={handleMouseDown}
          onDoubleClick={ui.sidebarIsClosed ? undefined : handleReset}
        />
      </Container>
      {ui.mobileSidebarVisible && <Backdrop onClick={handleCloseSidebar} />}
    </TooltipProvider>
  );
});

const Backdrop = styled.a`
  animation: ${fadeIn} 250ms ease-in-out;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  cursor: default;
  z-index: ${depths.mobileSidebar - 1};
  background: ${s("backdrop")};
`;

type ContainerProps = {
  $mobileSidebarVisible: boolean;
  $isAnimating: boolean;
  $collapsed: boolean;
  $hidden: boolean;
  $isMobile: boolean;
};

const Container = styled(Flex)<ContainerProps>`
  position: fixed;
  top: 0;
  bottom: 0;
  inset-inline-start: 0;
  width: 100%;
  height: 100vh;
  background: ${s("sidebarBackground")};
  transition:
    box-shadow var(--duration-fast) var(--ease-out),
    transform 250ms cubic-bezier(0.34, 1.15, 0.64, 1)
      ${(props: ContainerProps) =>
        props.$isAnimating ? `, width var(--duration) var(--ease-out)` : ""};
  transform: translateX(
    ${(props) => (props.$mobileSidebarVisible ? 0 : "-100%")}
  );
  z-index: ${depths.mobileSidebar};
  max-width: 80%;
  min-width: 280px;
  padding-inline-start: var(--sal);
  ${fadeOnDesktopBackgrounded()}

  [dir="rtl"] & {
    transform: translateX(
      ${(props) => (props.$mobileSidebarVisible ? 0 : "100%")}
    );
  }

  @media print {
    display: none;
    transform: none;
  }

  /* Fade the full navigation tree while the compact rail remains available. */
  & > * {
    transition: opacity var(--duration-fast) var(--ease-out);
    opacity: ${(props) => {
      if (props.$hidden) {
        return "0";
      }
      if (props.$isMobile) {
        return props.$mobileSidebarVisible ? "1" : "0";
      } else {
        return props.$collapsed ? "0" : "1";
      }
    }};
  }

  /* The compact rail has no panel surface behind it. */
  ${(props: ContainerProps) =>
    props.$collapsed &&
    `
      background: transparent;
      box-shadow: none;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      border: none;
      overflow: hidden;
    `}

  /* The compact rail is not resizable. */
  & > [class*="ResizeBorder"] {
    opacity: ${(props: ContainerProps) => (props.$collapsed ? "0" : "1")};
    pointer-events: ${(props: ContainerProps) =>
      props.$collapsed ? "none" : "auto"};
    transition: opacity var(--duration-fast) var(--ease-out);
  }

  ${breakpoint("tablet")`
    z-index: ${depths.sidebar};
    /* Float off the window edges like an Apple glass panel */
    margin: 12px 0 12px 12px;
    /* Anchor to viewport explicitly so the glass panel always fills the
       full available height regardless of content length. */
    top: 0;
    bottom: 0;
    height: calc(100vh - 24px);
    min-height: calc(100vh - 24px);
    min-width: 0;
    /* The collapsed state is a deliberate, clickable rail rather than a
       partially translated version of the full navigation panel. */
    border-radius: ${(props: ContainerProps) =>
      props.$collapsed ? "var(--radius-sm)" : "var(--radius-xl)"};
    /* Layered ring + soft ambient elevation — "floating in light" feel */
    box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.06), var(--shadow-2);
    /* macOS-style glass: backdrop blur + saturated color underneath */
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    /* The background must allow the blur to pick up content underneath;
       keep it translucent so glass effect reads through. */
    background: color-mix(in srgb, ${s("sidebarBackground")} 78%, transparent);
    transition:
      box-shadow var(--duration-fast) var(--ease-out),
      width var(--duration-slow) var(--ease-out);
    transform: none;

    [dir="rtl"] & {
      transform: none;
    }

    &:hover {
      ${ToggleButton} {
        opacity: 1;
      }
    }

  `};
`;

const CollapsedToggle = styled.button`
  position: absolute;
  top: 14px;
  inset-inline-start: 6px;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: var(--radius-sm);
  color: ${s("sidebarText")};
  background: color-mix(in srgb, ${s("sidebarBackground")} 84%, transparent);
  cursor: pointer;
  z-index: 1;
  opacity: 1 !important;
  pointer-events: auto;
  transition:
    background var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);

  &:hover,
  &:focus-visible {
    color: ${s("accent")};
    background: ${s("sidebarControlHoverBackground")};
    outline: none;
  }

  &:active {
    transform: scale(0.94);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

export default observer(Sidebar);
