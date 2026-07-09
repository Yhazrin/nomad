import { useCallback, useEffect, useState } from "react";
import usePersistedState from "~/hooks/usePersistedState";

/**
 * Identifiers for each tab in the DocumentContextRail.
 *
 *   - `connections` shows children / backlinks / similar documents.
 *   - `activity` lists recent document events.
 *   - `outline` shows the heading outline and current scroll position.
 */
export type ContextRailTab = "connections" | "activity" | "outline";

export const CONTEXT_RAIL_TABS: ContextRailTab[] = [
  "connections",
  "activity",
  "outline",
];

const DEFAULT_TAB: ContextRailTab = "connections";

/**
 * Hook for managing the active tab of the DocumentContextRail.
 *
 * The chosen tab is persisted per-document in local storage so the user
 * keeps their preferred view across reloads and navigations.
 *
 * @param documentId - The id of the document currently being viewed. The
 *   persisted state key is scoped to this id so each document remembers
 *   its own tab choice.
 * @returns The active tab id, a setter, and helpers for change detection.
 */
export function useContextRail(documentId: string | undefined) {
  const storageKey = documentId
    ? `nomad.contextRail.tab:${documentId}`
    : "nomad.contextRail.tab:_default";

  const [activeTab, setActiveTab] = usePersistedState<ContextRailTab>(
    storageKey,
    DEFAULT_TAB
  );

  // Track which tabs have been activated at least once so we can defer
  // expensive loads (events fetch, etc.) until they're actually needed.
  const [activatedTabs, setActivatedTabs] = useState<Set<ContextRailTab>>(
    () => new Set<ContextRailTab>([activeTab])
  );

  useEffect(() => {
    setActivatedTabs((prev) => {
      if (prev.has(activeTab)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  const setTab = useCallback(
    (tab: ContextRailTab) => {
      setActiveTab(tab);
    },
    [setActiveTab]
  );

  const isActivated = useCallback(
    (tab: ContextRailTab) => activatedTabs.has(tab),
    [activatedTabs]
  );

  return {
    activeTab,
    setTab,
    activatedTabs,
    isActivated,
  };
}

export default useContextRail;
