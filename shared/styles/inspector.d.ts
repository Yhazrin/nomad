import type { DefaultTheme, StyledComponent } from "styled-components";

/**
 * Prop contract for {@link InspectorTab}.
 */
export interface InspectorTabProps {
  /** Whether this tab is the currently-selected one. */
  $active?: boolean;
}

/** Outer right-rail container (fixed 280px on desktop, full-width flow on mobile). */
export const InspectorRail: StyledComponent<"aside", DefaultTheme>;

/** Inner section wrapper with `divider`-separated sections. */
export const InspectorPanel: StyledComponent<"div", DefaultTheme>;

/** Pill tab strip container. */
export const InspectorTabBar: StyledComponent<"div", DefaultTheme>;

/** A single pill tab button. */
export const InspectorTab: StyledComponent<
  "button",
  DefaultTheme,
  InspectorTabProps
>;

/** Text-only empty / loading placeholder for a rail section. */
export const InspectorEmptyState: StyledComponent<"div", DefaultTheme>;

declare const _default: StyledComponent<"aside", DefaultTheme>;
export default _default;
