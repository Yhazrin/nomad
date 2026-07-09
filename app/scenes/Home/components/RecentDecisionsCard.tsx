import { observer } from "mobx-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styled from "styled-components";
import type Document from "~/models/Document";
import { useLocationSidebarContext } from "~/hooks/useLocationSidebarContext";
import useStores from "~/hooks/useStores";
import { determineSidebarContext } from "~/components/Sidebar/components/SidebarContext";
import { homePath } from "~/utils/routeHelpers";
import Card from "./Card";

const DECISION_KEYWORDS = [/^decision\b/i, /\bdecision\b/i];

const MAX_ITEMS = 5;

/**
 * Returns true if a document title or text looks like a decision log.
 *
 * The check is intentionally simple and runs only on already-loaded
 * documents so we never trigger an extra search request from Home.
 */
function looksLikeDecision(doc: Document): boolean {
  if (!doc.title) {
    return false;
  }
  return DECISION_KEYWORDS.some((rx) => rx.test(doc.title));
}

/**
 * RecentDecisionsCard surfaces recently-updated documents whose titles look
 * like decisions (e.g. "Decision: …", "Architecture decision …").
 *
 * Source of truth: documentsStore.recentlyUpdated (no new store is added).
 */
function RecentDecisionsCard() {
  const { documents, auth } = useStores();
  const sidebarContext = useLocationSidebarContext();
  const { t } = useTranslation();

  React.useEffect(() => {
    void documents.fetchRecentlyUpdated({ limit: 50 });
  }, [documents]);

  const items = documents.recentlyUpdated
    .filter(looksLikeDecision)
    .slice(0, MAX_ITEMS);

  return (
    <Card
      title={t("Recent decisions")}
      action={
        <ViewAll to={{ pathname: homePath(), state: { sidebarContext } }}>
          {t("View all")}
        </ViewAll>
      }
    >
      {items.length === 0 ? (
        <EmptyMessage>
          {t(
            "Decision logs and architecture decisions will appear here once you create them."
          )}
        </EmptyMessage>
      ) : (
        <List>
          {items.map((doc) => (
            <DecisionRow
              key={doc.id}
              doc={doc}
              currentUser={auth.user}
              fallbackSidebarContext={sidebarContext}
            />
          ))}
        </List>
      )}
    </Card>
  );
}

/**
 * A single decision row.
 */
function DecisionRow({
  doc,
  currentUser,
  fallbackSidebarContext,
}: {
  doc: Document;
  currentUser: ReturnType<typeof useStores>["auth"]["user"];
  fallbackSidebarContext: ReturnType<typeof useLocationSidebarContext>;
}) {
  const { t } = useTranslation();
  const context =
    currentUser !== undefined
      ? determineSidebarContext({
          document: doc,
          user: currentUser,
          currentContext: fallbackSidebarContext,
        })
      : fallbackSidebarContext;

  return (
    <RowLink to={{ pathname: doc.path, state: { sidebarContext: context } }}>
      <Dot aria-hidden />
      <DocBody>
        <DocTitle>{doc.title || t("Untitled")}</DocTitle>
        <DocMeta>
          {t("Updated {{when}}", {
            when: new Date(doc.updatedAt).toLocaleDateString(),
          })}
        </DocMeta>
      </DocBody>
    </RowLink>
  );
}

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
`;

const RowLink = styled(Link)`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 8px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: inherit;
  cursor: var(--pointer);
  transition:
    background var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);

  &:hover {
    background: ${(props) => props.theme.listItemHoverBackground};
  }

  &:active {
    transform: scale(0.99);
  }

  & + & {
    border-top: 1px solid ${(props) => props.theme.divider};
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
`;

const Dot = styled.span`
  flex-shrink: 0;
  margin-top: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => props.theme.accent};
`;

const DocBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
`;

const DocTitle = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => props.theme.text};
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
`;

const DocMeta = styled.span`
  font-size: 12px;
  color: ${(props) => props.theme.textTertiary};
`;

const ViewAll = styled(Link)`
  font-size: 13px;
  font-weight: 500;
  color: ${(props) => props.theme.accent};
  text-decoration: none;
  cursor: var(--pointer);
  transition: opacity var(--duration-fast) var(--ease-out);

  &:hover {
    opacity: 0.8;
  }
`;

const EmptyMessage = styled.div`
  padding: 12px 4px 4px;
  font-size: 13px;
  color: ${(props) => props.theme.textTertiary};
`;

export default observer(RecentDecisionsCard);
