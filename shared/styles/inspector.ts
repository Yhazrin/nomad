import { s, hover } from "./index";
import styled from "styled-components";
import breakpoint from "styled-components-breakpoint";

/**
 * Shared layout primitives for the right-rail Context Inspector.
 *
 * Design intent (Phase 1 — stable shell):
 *   - A calm, flat surface that separates from the canvas with a subtle
 *     `backgroundSecondary` fill and a single hairline `divider` border — no
 *     glassmorphism, no decorative chrome, no placeholder cards.
 *   - Desktop (>= `desktopLarge`, 1600px): a fixed 280px right rail that sticks
 *     within the document column and scrolls independently.
 *   - Mobile/tablet: the rail collapses its chrome and flows below the canvas as
 *     a normal full-width block (its parent layout is a column at these widths),
 *     so the context is never a blocker on narrow screens.
 *
 * Only `transform` and `opacity` are ever animated. Widths/borders switch at
 * breakpoints without transition to avoid layout-thrash on resize.
 */

const RAIL_WIDTH = 280;

/**
 * Outer rail container. Full-width flow block on small screens (sits below the
 * canvas), a fixed-width sticky rail on desktop. Children own their padding.
 */
export const InspectorRail = styled.aside`
  width: 100%;
  box-sizing: border-box;
  padding: 0;

  /* Collapse when there is nothing meaningful to show — either no children at
     all, or only empty (self-hidden) sections. Preserves the "hide when the
     document has no context" behavior on every screen size. */
  &:empty,
  &:not(:has(> *:not(:empty))) {
    display: none;
  }

  @media print {
    display: none;
  }

  ${breakpoint("desktopLarge")`
    width: ${RAIL_WIDTH}px;
    flex: 0 0 ${RAIL_WIDTH}px;
    align-self: stretch;
    background: ${s("backgroundSecondary")};
    border-inline-start: 1px solid ${s("divider")};
    overflow-y: auto;
    overscroll-behavior: contain;
    position: sticky;
    top: calc(var(--header-offset, 64px) + 16px);
    max-height: calc(100vh - var(--header-offset, 64px) - 32px);
  `};
`;

/**
 * Inner content wrapper for a single inspector section. Sections are separated
 * from one another by a hairline `divider`; the last one omits its border.
 */
export const InspectorPanel = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${s("divider")};

  &:last-child {
    border-bottom: none;
  }

  /* A section with no rendered content collapses so it neither reserves space
     nor draws a stray divider. */
  &:empty {
    display: none;
  }
`;

/**
 * Pill tab strip. Hosts `InspectorTab` buttons. Horizontally scrollable when
 * the tabs overflow, but never grows the rail.
 */
export const InspectorTabBar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
`;

interface InspectorTabProps {
  /** Whether this tab is the currently-selected one. */
  $active?: boolean;
}

/**
 * A single pill tab. Selected tabs use the theme accent; unselected tabs are
 * transparent and reveal `listItemHoverBackground` on hover.
 */
export const InspectorTab = styled.button<InspectorTabProps>`
  appearance: none;
  border: 0;
  margin: 0;
  cursor: var(--pointer);
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  padding: 6px 12px;
  border-radius: var(--radius-pill, 999px);
  background: ${(props) =>
    props.$active ? props.theme.accent : "transparent"};
  color: ${(props) =>
    props.$active ? props.theme.accentText : props.theme.textSecondary};
  transition:
    background var(--duration-fast, 160ms)
      var(--ease-out, cubic-bezier(0.32, 0.72, 0, 1)),
    color var(--duration-fast, 160ms)
      var(--ease-out, cubic-bezier(0.32, 0.72, 0, 1));

  &: ${hover} {
    background: ${(props) =>
      props.$active ? props.theme.accent : props.theme.listItemHoverBackground};
  }
`;

/**
 * Empty / loading placeholder for a rail section. Intentionally text-only —
 * no decorative icon — per project rules.
 */
export const InspectorEmptyState = styled.div`
  color: ${s("textTertiary")};
  font-size: 13px;
  line-height: 1.5;
  padding: 24px 16px;
  text-align: center;
`;

export default InspectorRail;
