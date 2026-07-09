import { observer } from "mobx-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styled from "styled-components";
import type Document from "~/models/Document";
import type Event from "~/models/Event";
import { useLocationSidebarContext } from "~/hooks/useLocationSidebarContext";
import useStores from "~/hooks/useStores";
import { determineSidebarContext } from "~/components/Sidebar/components/SidebarContext";
import { dateToRelative } from "@shared/utils/date";
import { homePath } from "~/utils/routeHelpers";
import Card from "./Card";

const MAX_EVENTS = 10;

/**
 * Human-readable description of an event name.
 *
 * @param name the raw event name from the backend.
 * @returns a short, present-tense phrase that reads well with
 *   "actor {verb} target".
 */
function describeEvent(name: string): string {
  switch (name) {
    case "documents.create":
      return "created";
    case "documents.publish":
      return "published";
    case "documents.update":
      return "updated";
    case "documents.delete":
      return "deleted";
    case "documents.restore":
      return "restored";
    case "documents.archive":
      return "archived";
    case "documents.unarchive":
      return "unarchived";
    case "documents.move":
      return "moved";
    case "documents.pin":
      return "pinned";
    case "documents.unpin":
      return "unpinned";
    case "documents.star":
      return "starred";
    case "documents.unstar":
      return "unstarred";
    case "documents.add_user":
      return "shared";
    case "documents.remove_user":
      return "removed";
    case "comments.create":
      return "commented on";
    case "comments.update":
      return "edited a comment on";
    case "comments.resolve":
      return "resolved a comment on";
    case "comments.unresolve":
      return "reopened a comment on";
    default:
      return name.replace(/^[a-z]+\./, "").replace(/_/g, " ");
  }
}

/**
 * RecentActivityCard shows the latest 10 events across all documents visible
 * to the current user. Each row is "actor action target-doc".
 *
 * Source of truth: eventsStore.orderedData (no new store added).
 */
function RecentActivityCard() {
  const { events, auth } = useStores();
  const sidebarContext = useLocationSidebarContext();
  const { t } = useTranslation();

  React.useEffect(() => {
    void events.fetchPage({ limit: MAX_EVENTS });
  }, [events]);

  const items = events.orderedData
    .filter((event) => event.documentId !== undefined)
    .slice(0, MAX_EVENTS);

  return (
    <Card
      title={t("Recent activity")}
      action={
        <ViewAll to={{ pathname: homePath(), state: { sidebarContext } }}>
          {t("View all")}
        </ViewAll>
      }
    >
      {items.length === 0 ? (
        <EmptyMessage>
          {t(
            "Recent edits, comments, and shares across your workspace will appear here."
          )}
        </EmptyMessage>
      ) : (
        <List>
          {items.map((event) => (
            <ActivityRow
              key={event.id}
              event={event}
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
 * A single activity row.
 */
function ActivityRow({
  event,
  currentUser,
  fallbackSidebarContext,
}: {
  event: Event<Document>;
  currentUser: ReturnType<typeof useStores>["auth"]["user"];
  fallbackSidebarContext: ReturnType<typeof useLocationSidebarContext>;
}) {
  const { documents } = useStores();
  const { t } = useTranslation();

  const doc =
    event.document ??
    (event.documentId ? documents.get(event.documentId) : undefined);

  const actorName = event.actor?.name ?? t("Someone");
  const action = describeEvent(event.name);
  const targetTitle = doc?.title ?? t("a document");

  const when = event.createdAt
    ? dateToRelative(new Date(event.createdAt), {
        addSuffix: true,
        shorten: true,
      })
    : "";

  const context =
    doc && currentUser !== undefined
      ? determineSidebarContext({
          document: doc,
          user: currentUser,
          currentContext: fallbackSidebarContext,
        })
      : fallbackSidebarContext;

  if (!doc) {
    return (
      <Row aria-label={`${actorName} ${action} ${targetTitle}`}>
        <Actor>{actorName}</Actor>
        <Action>{action}</Action>
        <Target>{targetTitle}</Target>
        {when ? <When>· {when}</When> : null}
      </Row>
    );
  }

  return (
    <RowLink
      to={{ pathname: doc.path, state: { sidebarContext: context } }}
      aria-label={`${actorName} ${action} ${targetTitle}`}
    >
      <Actor>{actorName}</Actor>
      <Action>{action}</Action>
      <Target>{targetTitle}</Target>
      {when ? <When>· {when}</When> : null}
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

const sharedRow = `
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 8px;
  font-size: 13px;
  color: inherit;
  text-decoration: none;
`;

const Row = styled.li`
  ${sharedRow}
  & + & {
    border-top: 1px solid ${(props) => props.theme.divider};
  }
`;

const RowLink = styled(Link)`
  ${sharedRow}
  cursor: var(--pointer);
  border-radius: var(--radius-sm);
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

const Actor = styled.span`
  font-weight: 500;
  color: ${(props) => props.theme.text};
  white-space: nowrap;
`;

const Action = styled.span`
  color: ${(props) => props.theme.textTertiary};
  white-space: nowrap;
`;

const Target = styled.span`
  color: ${(props) => props.theme.text};
  font-weight: 500;
  min-width: 0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const When = styled.span`
  color: ${(props) => props.theme.textTertiary};
  font-size: 12px;
  white-space: nowrap;
  flex-shrink: 0;
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

export default observer(RecentActivityCard);
