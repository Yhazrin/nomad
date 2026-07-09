import { s, hideScrollbars, hover } from "@shared/styles";
import styled, { keyframes } from "styled-components";
import breakpoint from "styled-components-breakpoint";

/**
 * Shared layout primitives for the right-rail Context Inspector.
 *
 * Design intent:
 *   - Match the floating Sidebar's glass-morphism.
 *   - Layered "Double-Bezel" surface: outer shell (hairline border + soft
 *     ambient shadow) + inner core (slight inset highlight, distinct radius).
 *   - Sticky on desktop >= `desktopLarge` so it tracks scroll within the editor
 *     column without leaking beyond the document gutter.
 *
 * Mobile/tablet (< 1280px) collapses the entire inspector via display:none.
 * The right rail is an affordance, never a blocker — the document must remain
 * usable on narrow screens.
 */

const INSPECTOR_WIDTH = 280;
const INSPECTOR_WIDTH_LARGE = 300;

const railEnter = keyframes`
  from {
    opacity: 0;
    transform: translateX(8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const shineKeyframes = keyframes`
  to {
    transform: translateX(100%);
  }
`;

/**
 * Outer rail wrapper. Sticks to the right of the document and animates in
 * once on mount. Hidden on mobile/tablet.
 */
export const InspectorRail = styled.aside`
  display: none;

  ${breakpoint("desktopLarge")`
    display: flex;
    flex-direction: column;
    width: ${INSPECTOR_WIDTH}px;
    flex-shrink: 0;
    align-self: flex-start;
    position: sticky;
    top: calc(64px + 16px);
    max-height: calc(100vh - 96px);
    animation: ${railEnter} 420ms var(--ease-out, cubic-bezier(0.32, 0.72, 0, 1)) both;
  `};

  @media (min-width: 1600px) {
    width: ${INSPECTOR_WIDTH_LARGE}px;
  }

  @media print {
    display: none;
  }
`;

/**
 * Outer "Double-Bezel" shell — gives the inspector its physical-machined
 * feel without resorting to thick drop shadows. The inner panel handles
 * content; the shell supplies padding and a hairline outer border.
 */
export const InspectorShell = styled.div`
  position: relative;
  padding: 2px;
  border-radius: var(--radius-lg, 18px);
  background: ${s("sidebarControlHoverBackground")};
  border: 1px solid ${s("inputBorder")};
  box-shadow: ${s("shadow2")};
`;

/**
 * Inner core of the inspector. Distinct background, distinct radius
 * (radius - padding), and an inset top highlight to read as floating glass.
 */
export const InspectorPanel = styled.div`
  background: ${s("sidebarBackground")};
  border-radius: calc(var(--radius-lg, 18px) - 4px);
  padding: 8px 0 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    ${s("shadow1")};

  ${breakpoint("desktop")`
    backdrop-filter: blur(24px) saturate(140%);
    -webkit-backdrop-filter: blur(24px) saturate(140%);
  `};
`;

/** Header area for the inspector (title + small status hint). */
export const InspectorHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 14px 8px;
  border-bottom: 1px solid ${s("divider")};
`;

export const InspectorTitle = styled.h3`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${s("textTertiary")};
  margin: 0;
`;

export const InspectorHint = styled.span`
  font-size: 11px;
  color: ${s("textTertiary")};
  font-variant-numeric: tabular-nums;
`;

/** Tab strip area. */
export const InspectorTabs = styled.nav`
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 8px 6px 6px;
  overflow-x: auto;
  border-bottom: 1px solid ${s("divider")};
  ${hideScrollbars()}
`;

/**
 * Individual tab button. Pill-shaped, uses an inner underline rendered by
 * a framer-motion `Active` element.
 */
export const InspectorTabButton = styled.button<{ $active: boolean }>`
  position: relative;
  appearance: none;
  border: 0;
  cursor: var(--pointer);
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.01em;
  padding: 6px 8px;
  border-radius: 999px;
  white-space: nowrap;
  background: ${(props) => (props.$active ? props.theme.sidebarActiveBackground : "transparent")};
  color: ${(props) => (props.$active ? props.theme.text : props.theme.textTertiary)};
  transition:
    background var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);

  &:${hover} {
    background: ${(props) => (props.$active ? props.theme.sidebarActiveBackground : props.theme.sidebarHoverBackground)};
    color: ${(props) => props.theme.textSecondary};
  }
`;

/** Scrollable tab body. */
export const InspectorBody = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  ${hideScrollbars()}
`;

/** Empty-state placeholder for stub tabs. */
export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 28px 8px;
  text-align: center;
  color: ${s("textTertiary")};
`;

export const EmptyStateTitle = styled.div`
  font-size: 12.5px;
  font-weight: 500;
  color: ${s("textSecondary")};
  letter-spacing: -0.005em;
`;

/** Square icon container used inside EmptyState to fade outline-icons. */
export const EmptyStateIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: ${s("inputBackground")};
  color: ${s("textTertiary")};
  opacity: 0.85;
`;

export const EmptyStateHint = styled.div`
  font-size: 11.5px;
  color: ${s("textTertiary")};
  max-width: 200px;
  line-height: 1.45;
`;

/** Loading shimmer placeholder used by tabs that fetch real data. */
export const LoadingBlock = styled.div`
  height: 10px;
  border-radius: 999px;
  background: ${s("sidebarHoverBackground")};
  position: relative;
  overflow: hidden;
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent,
      ${s("sidebarControlHoverBackground")},
      transparent
    );
    transform: translateX(-100%);
    animation: ${shineKeyframes} 1.4s var(--ease-in-out, cubic-bezier(0.4, 0, 0.2, 1))
      infinite;
  }
`;

/** A clickable list item — used for Outline / Backlinks rows. */
export const Row = styled.button`
  appearance: none;
  background: transparent;
  border: 0;
  text-align: left;
  cursor: var(--pointer);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 8px;
  color: ${s("textSecondary")};
  font-size: 12.5px;
  line-height: 1.4;
  transition:
    background var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);

  &:${hover} {
    background: ${s("sidebarHoverBackground")};
    color: ${s("text")};
  }

  &:active {
    transform: scale(0.985);
  }
`;

/** Visually-hidden helper for accessibility-only labels. */
export const SrOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export default InspectorRail;
