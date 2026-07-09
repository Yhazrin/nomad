import { observer } from "mobx-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styled from "styled-components";
import type Document from "~/models/Document";
import useCurrentTeam from "~/hooks/useCurrentTeam";
import { useLocationSidebarContext } from "~/hooks/useLocationSidebarContext";
import useStores from "~/hooks/useStores";
import { determineSidebarContext } from "~/components/Sidebar/components/SidebarContext";
import { dateToRelative } from "@shared/utils/date";
import { homePath } from "~/utils/routeHelpers";
import Card from "./Card";

/**
 * ContinueReadingCard shows up to 5 documents the current user has recently
 * viewed, each as a row with its icon, title, and relative timestamp.
 *
 * Source of truth: documentsStore.recentlyViewed.
 */
function ContinueReadingCard() {
  const { documents, auth } = useStores();
  const team = useCurrentTeam();
  const sidebarContext = useLocationSidebarContext();
  const { t } = useTranslation();

  React.useEffect(() => {
    void documents.fetchRecentlyViewed({ limit: 5 });
  }, [documents]);

  const items = documents.recentlyViewed.slice(0, 5);

  return (
    <Card
      title={t("Continue reading")}
      action={
        <ViewAll to={{ pathname: homePath(), state: { sidebarContext } }}>
          {t("View all")}
        </ViewAll>
      }
    >
      {items.length === 0 ? (
        <EmptyMessage>{t("Start by creating a document")}</EmptyMessage>
      ) : (
        <List>
          {items.map((doc) => (
            <ContinueReadingRow
              key={doc.id}
              doc={doc}
              currentUser={auth.user}
              currentTeam={team}
              fallbackSidebarContext={sidebarContext}
            />
          ))}
        </List>
      )}
    </Card>
  );
}

/**
 * A single row in the Continue Reading list.
 */
function ContinueReadingRow({
  doc,
  currentUser,
  currentTeam,
  fallbackSidebarContext,
}: {
  doc: Document;
  currentUser: ReturnType<typeof useStores>["auth"]["user"];
  currentTeam: ReturnType<typeof useStores>["auth"]["team"];
  fallbackSidebarContext: ReturnType<typeof useLocationSidebarContext>;
}) {
  const { t } = useTranslation();
  const context =
    currentUser && currentTeam
      ? determineSidebarContext({
          document: doc,
          user: currentUser,
          currentContext: fallbackSidebarContext,
        })
      : fallbackSidebarContext;

  const lastViewed = doc.lastViewedAt
    ? dateToRelative(new Date(doc.lastViewedAt), {
        addSuffix: true,
        shorten: true,
      })
    : t("Recently");

  return (
    <RowLink
      to={{ pathname: doc.path, state: { sidebarContext: context } }}
      aria-label={doc.title}
    >
      <DocIcon aria-hidden>{doc.icon || "📄"}</DocIcon>
      <DocBody>
        <DocTitle>{doc.title || t("Untitled")}</DocTitle>
        <DocMeta>{lastViewed}</DocMeta>
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
  align-items: center;
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

const DocIcon = styled.span`
  font-size: 20px;
  line-height: 1;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
`;

const DocBody = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
`;

const DocTitle = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => props.theme.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DocMeta = styled.span`
  font-size: 12px;
  color: ${(props) => props.theme.textTertiary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

export default observer(ContinueReadingCard);
