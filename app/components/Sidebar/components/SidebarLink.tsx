import type { LocationDescriptor } from "history";
import * as React from "react";
import styled, { useTheme, css } from "styled-components";
import breakpoint from "styled-components-breakpoint";
import EventBoundary from "@shared/components/EventBoundary";
import { ellipsis, hover, s } from "@shared/styles";
import { isMobile } from "@shared/utils/browser";
import NudeButton from "~/components/NudeButton";
import { UnreadBadge } from "~/components/UnreadBadge";
import useClickIntent from "~/hooks/useClickIntent";
import { undraggableOnDesktop } from "~/styles";
import Disclosure from "./Disclosure";
import type { Props as NavLinkProps } from "./NavLink";
import NavLink from "./NavLink";
import type { ActionWithChildren } from "~/types";
import { ContextMenu } from "~/components/Menu/ContextMenu";
import { useTranslation } from "react-i18next";

/**
 * Props for the SidebarLink component.
 * Extends NavLink props with additional sidebar-specific functionality.
 */
type Props = Omit<NavLinkProps, "to"> & {
  /** The location to navigate to when the link is clicked */
  to?: LocationDescriptor;
  /** Ref callback to access the underlying HTML element */
  innerRef?: (ref: HTMLElement | null | undefined) => void;
  /** Callback fired when the link is clicked */
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  /** Callback when we expect the user to click on the link. Used for prefetching data. */
  onClickIntent?: React.MouseEventHandler<HTMLElement>;
  /** Callback fired when the disclosure icon is clicked */
  onDisclosureClick?: React.MouseEventHandler<HTMLElement>;
  /** Icon to display on the left side of the link */
  icon?: React.ReactNode;
  /** Text label or content to display for the link */
  label?: React.ReactNode;
  /** Optional menu to display on hover or interaction */
  menu?: React.ReactNode;
  /** Whether to show an unread badge indicator */
  unreadBadge?: boolean;
  /** Whether to show action buttons on hover */
  $showActions?: boolean;
  /** Whether the link is disabled and non-interactive */
  disabled?: boolean;
  /** Whether the link is currently active */
  active?: boolean;
  /** If set, a disclosure will be rendered to the left of any icon */
  expanded?: boolean;
  /** Whether this link is the current active drop target for drag and drop */
  isActiveDrop?: boolean;
  /** Whether this link represents a draft document */
  isDraft?: boolean;
  /** Nesting depth level for indentation (0-based) */
  depth?: number;
  /** Whether to truncate the label text (default: true, causes overflow: hidden) */
  ellipsis?: boolean;
  /** Whether to automatically scroll this link into view if needed */
  scrollIntoViewIfNeeded?: boolean;
  /** Optional context menu action to display */
  contextAction?: ActionWithChildren;
};

const activeDropStyle = {
  fontWeight: 600,
};

// Prevents the parent NavLink's mousedown handler from firing (which would
// navigate or toggle), without calling preventDefault — that would block the
// native HTML5 drag from initiating on the draggable row.
const stopPropagation = (ev: React.MouseEvent) => {
  ev.stopPropagation();
};

function SidebarLink(
  {
    icon,
    onClick,
    onClickIntent,
    to,
    label,
    active,
    isActiveDrop,
    isDraft,
    menu,
    $showActions,
    exact,
    href,
    depth,
    className,
    expanded,
    onDisclosureClick,
    disabled,
    unreadBadge,
    contextAction,
    ellipsis = true,
    ...rest
  }: Props,
  ref: React.RefObject<HTMLAnchorElement>
) {
  const hasDisclosure = expanded !== undefined;
  const { t } = useTranslation();
  const theme = useTheme();
  const { handleMouseEnter, handleMouseLeave } = useClickIntent(onClickIntent);
  const style = React.useMemo(
    () => ({
      paddingInlineStart: `${(depth || 0) * 16 + 12}px`,
      paddingInlineEnd: unreadBadge ? "32px" : undefined,
    }),
    [depth, unreadBadge]
  );

  const unreadStyle = React.useMemo(
    () => ({
      insetInlineEnd: -20,
    }),
    []
  );

  const activeStyle = React.useMemo(
    () => ({
      color: theme.accentText,
      background: theme.accent,
      ...style,
    }),
    [theme.accentText, theme.accent, style]
  );

  const handleClick = React.useCallback(
    (ev: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick && !disabled && ev.isDefaultPrevented() === false) {
        onClick(ev);
      }
    },
    [onClick, disabled]
  );

  const handleDisclosureClick = React.useCallback(
    (ev: React.MouseEvent<HTMLElement>) => {
      if (!hasDisclosure) {
        return;
      }
      ev.preventDefault();
      ev.stopPropagation();
      onDisclosureClick?.(ev);
    },
    [onDisclosureClick, hasDisclosure]
  );

  const DisclosureComponent = icon ? HiddenDisclosure : Disclosure;

  const innerContent = (
    <>
      <ContextMenu action={contextAction} ariaLabel={t("Link options")}>
        <Content>
          {hasDisclosure && (
            <DisclosureComponent
              expanded={expanded}
              onClick={handleDisclosureClick}
              onMouseDown={stopPropagation}
              tabIndex={-1}
            />
          )}
          {icon && <IconWrapper aria-hidden>{icon}</IconWrapper>}
          <Label $ellipsis={ellipsis}>{label}</Label>
          {unreadBadge && <UnreadBadge style={unreadStyle} />}
        </Content>
      </ContextMenu>
      {menu && <Actions $showActions={$showActions}>{menu}</Actions>}
    </>
  );

  if (!to) {
    return (
      <Link
        as={href ? "a" : "button"}
        $isActiveDrop={isActiveDrop}
        $isDraft={isDraft}
        $disabled={disabled}
        style={active ? activeStyle : style}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDragEnter={handleMouseEnter}
        href={href}
        className={className}
        ref={ref}
        {...rest}
      >
        {innerContent}
      </Link>
    );
  }

  return (
    <Link
      $isActiveDrop={isActiveDrop}
      $isDraft={isDraft}
      $disabled={disabled}
      style={active ? activeStyle : style}
      activeStyle={isActiveDrop ? activeDropStyle : activeStyle}
      onClick={handleClick}
      onActiveClick={handleDisclosureClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDragEnter={handleMouseEnter}
      exact={exact !== false}
      to={to!}
      href={href}
      className={className}
      // @ts-expect-error spread props cause overload mismatch with styled NavLink
      ref={ref}
      {...rest}
    >
      {innerContent}
    </Link>
  );
}

// accounts for whitespace around icon
export const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  overflow: hidden;
  flex-shrink: 0;
  transition: opacity var(--duration-fast) var(--ease-out);

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Content = styled.span`
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  width: 100%;
  min-width: 0;
`;

const Actions = styled(EventBoundary)<{ $showActions?: boolean }>`
  display: inline-flex;
  visibility: ${(props) => (props.$showActions ? "visible" : "hidden")};
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  inset-inline-end: 6px;
  gap: 2px;
  color: ${s("textTertiary")};
  transition: opacity var(--duration-fast) var(--ease-out);
  height: 24px;
  background: transparent;

  svg {
    color: ${s("textSecondary")};
    fill: currentColor;
    opacity: 0.5;
  }

  &:hover {
    visibility: visible;

    svg {
      opacity: 0.75;
    }
  }
`;

const HiddenDisclosure = styled(Disclosure)`
  position: inherit;
  inset-inline-start: initial;
  display: none;
  margin-inline-start: -2px;
  margin-inline-end: 0;
`;

const Link = styled(NavLink)<{
  $isActiveDrop?: boolean;
  $isDraft?: boolean;
  $disabled?: boolean;
}>`
  /* ── Apple-style nav row ──────────────────────────────────────────── */
  /* Pill shape, transparent by default, gentle hover lift. */
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  text-overflow: ellipsis;
  font-weight: 475;
  padding: 8px 12px;
  border-radius: var(--radius-pill);
  min-height: 30px;
  user-select: none;
  white-space: nowrap;
  background: transparent;
  color: ${(props) =>
    props.$isActiveDrop ? props.theme.white : props.theme.sidebarText};
  font-size: 15px;
  letter-spacing: -0.005em;
  cursor: var(--pointer);
  overflow: hidden;
  border: 0;
  width: 100%;
  /* Apple cubic-bezier — pair fast duration with the signature out curve. */
  transition: transform var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
  ${undraggableOnDesktop()}

  ${(props) =>
    props.$disabled &&
    css`
      pointer-events: none;
      opacity: 0.75;
    `}

  ${(props) =>
    props.$isDraft &&
    css`
      &:after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        border-radius: var(--radius-pill);
        border: 1.5px dashed ${props.theme.sidebarDraftBorder};
      }
    `}

  /* ── Inactive hover: subtle wash + 2px nudge ──────────────────────── */
  &: ${hover},
  &:has([data-state="open"]) {
    background: rgba(0, 0, 0, 0.04);
    transform: translateX(2px);

    ${HiddenDisclosure} {
      display: block;
    }
    ${HiddenDisclosure} + ${IconWrapper} {
      visibility: hidden;
      opacity: 0;
      width: 0;
    }
  }

  /* ── Active state: accent pill with a soft inner highlight ────────── */
  &[aria-current="page"] {
    background: ${s("accent")};
    color: ${s("accentText")};
    /* Multi-layer shadow — close crisp + wide diffused (Apple rule). */
    box-shadow: 0 1px 2px rgba(10, 132, 255, 0.18),
      0 4px 12px rgba(10, 132, 255, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.18);
  }

  &[aria-current="page"] ${Actions} {
    --background: transparent;
  }

  ${(props) => props.$isActiveDrop && `--background: ${props.theme.slateDark};`}

  svg {
    ${(props) => (props.$isActiveDrop ? `fill: ${props.theme.white};` : "")}
    transition: fill 50ms;
  }

  ${breakpoint("tablet")`
    padding: 8px 12px;
    font-size: 14px;
    gap: 12px;
  `}

  @media (hover: hover) {
    &:hover ${Actions},
    &:active ${Actions},
    &:has([data-state="open"]) ${Actions} {
      visibility: visible;

      svg {
        opacity: 0.75;
      }
    }

    &:hover,
    &:has([data-state="open"]) {
      color: ${(props) =>
        props.$isActiveDrop ? props.theme.white : props.theme.text};
    }

    /* Active items do not lift on hover — they sit firm like tabs. */
    &[aria-current="page"]:hover,
    &[aria-current="page"]:has([data-state="open"]) {
      background: ${s("accent")};
      color: ${s("accentText")};
      transform: none;
    }
  }

  & ${Actions} {
    ${NudeButton} {
      background: transparent;

      &:hover,
      &[aria-expanded="true"] {
        background: ${s("sidebarControlHoverBackground")};
      }
    }
  }
`;

const Label = styled.div<{ $ellipsis: boolean }>`
  position: relative;
  width: 100%;
  line-height: 22px;
  min-width: 0;
  text-align: start;

  ${(props) => props.$ellipsis && ellipsis()}

  * {
    unicode-bidi: plaintext;
  }
`;

export default React.forwardRef<HTMLAnchorElement, Props>(SidebarLink);
