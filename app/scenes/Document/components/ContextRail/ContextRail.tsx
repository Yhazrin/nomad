import { observer } from "mobx-react";
import { lazy, Suspense, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Trans } from "react-i18next";
import {
  InspectorRail,
  InspectorTabBar,
  InspectorTab,
  InspectorPanel,
  InspectorEmptyState,
} from "@shared/styles/inspector";
import type Document from "~/models/Document";
import useContextRail, {
  CONTEXT_RAIL_TABS,
  type ContextRailTab,
} from "./useContextRail";

// Tabs are lazy-loaded so that heavy fetches (Activity event history,
// outline observer setup) only happen the first time the user actually
// switches to them.
const ConnectionsTab = lazy(() => import("./tabs/ConnectionsTab"));
const ActivityTab = lazy(() => import("./tabs/ActivityTab"));
const OutlineTab = lazy(() => import("./tabs/OutlineTab"));

type Props = {
  document: Document;
};

const TAB_LABELS: Record<ContextRailTab, string> = {
  connections: "Connections",
  activity: "Activity",
  outline: "Outline",
};

function ContextRail({ document }: Props) {
  const { t } = useTranslation();
  const { activeTab, setTab, isActivated } = useContextRail(document.id);

  const handleTabKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, tab: ContextRailTab) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const idx = CONTEXT_RAIL_TABS.indexOf(activeTab);
        const next =
          (idx + direction + CONTEXT_RAIL_TABS.length) %
          CONTEXT_RAIL_TABS.length;
        setTab(CONTEXT_RAIL_TABS[next]);
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setTab(tab);
      }
    },
    [activeTab, setTab]
  );

  return (
    <InspectorRail
      aria-label={t("Document context rail")}
      data-document-context-rail
    >
      <InspectorPanel style={{ paddingTop: 12 }}>
        <InspectorTabBar
          role="tablist"
          aria-label={t("Document context sections")}
        >
          {CONTEXT_RAIL_TABS.map((tab) => (
            <InspectorTab
              key={tab}
              type="button"
              role="tab"
              $active={activeTab === tab}
              aria-selected={activeTab === tab}
              aria-controls={`context-tab-panel-${tab}`}
              id={`context-tab-${tab}`}
              onClick={() => setTab(tab)}
              onKeyDown={(event) => handleTabKeyDown(event, tab)}
              tabIndex={activeTab === tab ? 0 : -1}
            >
              {t(TAB_LABELS[tab])}
            </InspectorTab>
          ))}
        </InspectorTabBar>
      </InspectorPanel>

      {CONTEXT_RAIL_TABS.map((tab) => (
        <InspectorPanel
          key={tab}
          role="tabpanel"
          aria-labelledby={`context-tab-${tab}`}
          id={`context-tab-panel-${tab}`}
          hidden={activeTab !== tab}
          style={activeTab === tab ? undefined : { display: "none" }}
        >
          {isActivated(tab) && activeTab === tab ? (
            <Suspense fallback={<TabFallback />}>
              {tab === "connections" && <ConnectionsTab document={document} />}
              {tab === "activity" && <ActivityTab document={document} />}
              {tab === "outline" && <OutlineTab document={document} />}
            </Suspense>
          ) : activeTab === tab ? (
            <TabFallback />
          ) : null}
        </InspectorPanel>
      ))}
    </InspectorRail>
  );
}

function TabFallback() {
  return (
    <InspectorEmptyState>
      <Trans>Loading…</Trans>
    </InspectorEmptyState>
  );
}

export default observer(ContextRail);
