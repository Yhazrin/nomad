import { observer } from "mobx-react";
import { orderBy } from "es-toolkit/compat";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { InspectorEmptyState } from "@shared/styles/inspector";
import { s } from "@shared/styles";
import { Avatar, AvatarSize } from "~/components/Avatar";
import type Document from "~/models/Document";
import type User from "~/models/User";
import type Event from "~/models/Event";
import useStores from "~/hooks/useStores";

const ACTIVITY_EVENT_NAMES = [
  "documents.create",
  "documents.publish",
  "documents.unpublish",
  "documents.update",
  "documents.archive",
  "documents.unarchive",
  "documents.delete",
  "documents.restore",
  "documents.move",
  "documents.add_user",
  "documents.remove_user",
];

const ACTIVITY_LIMIT = 20;

type Props = {
  document: Document;
};

type ActivityEntry = {
  id: string;
  actor: User | undefined;
  actorInitial: string;
  action: string;
  timestamp: number;
  verbKey: string;
};

function ActivityTab({ document }: Props) {
  const { t } = useTranslation();
  const { events } = useStores();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        await events.fetchPage({
          documentId: document.id,
          events: ACTIVITY_EVENT_NAMES,
          limit: ACTIVITY_LIMIT,
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    // Refresh on demand if the user switches back to the tab.
    const interval = window.setInterval(() => {
      if (!cancelled) {
        setRefreshTick((tick) => tick + 1);
      }
    }, 30_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [events, document.id]);

  // Recompute on refreshTick so we re-derive when the polling timer fires.
  const entries = useMemo(() => {
    void refreshTick;
    const eventsForDoc = events
      .getByDocumentId(document.id)
      .filter((event) => ACTIVITY_EVENT_NAMES.includes(event.name));
    return orderBy(eventsForDoc, "createdAt", "desc").slice(
      0,
      ACTIVITY_LIMIT
    ) as Event<Document>[];
  }, [events, document.id, refreshTick]);

  const items = useMemo<ActivityEntry[]>(
    () =>
      entries.map((event) => ({
        id: event.id,
        actor: event.actor,
        actorInitial: actorInitial(event.actor),
        action: event.name,
        timestamp: new Date(event.createdAt).getTime(),
        verbKey: verbKey(event.name),
      })),
    [entries]
  );

  if (isLoading) {
    return (
      <TabBody>
        {[0, 1, 2, 3, 4].map((i) => (
          <LoadingRow key={i}>
            <AvatarPlaceholder />
            <div style={{ flex: 1 }}>
              <LoadingBar style={{ width: "60%" }} />
              <LoadingBar style={{ width: "30%", marginTop: 6 }} />
            </div>
          </LoadingRow>
        ))}
      </TabBody>
    );
  }

  if (error) {
    return (
      <InspectorEmptyState>
        {t("Could not load activity: {{message}}", {
          message: error.message,
        })}
      </InspectorEmptyState>
    );
  }

  if (items.length === 0) {
    return <InspectorEmptyState>{t("No activity yet.")}</InspectorEmptyState>;
  }

  return (
    <TabBody>
      <ActivityList>
        {items.map((entry, index) => (
          <ActivityRow
            key={entry.id}
            // first row should not show a connecting line above
            $isFirst={index === 0}
          >
            <AvatarContainer>
              <ActorAvatar model={entry.actor} initial={entry.actorInitial} />
              <ActivityLine />
            </AvatarContainer>
            <ActivityContent>
              <ActivityVerb>
                <ActorName>{entry.actor?.name ?? t("Someone")}</ActorName>{" "}
                <Verb>{t(entry.verbKey)}</Verb>
              </ActivityVerb>
              <ActivityMeta>{formatRelative(entry.timestamp)}</ActivityMeta>
            </ActivityContent>
          </ActivityRow>
        ))}
      </ActivityList>
    </TabBody>
  );
}

function ActorAvatar({
  model,
  initial,
}: {
  model: ActivityEntry["actor"];
  initial: string;
}) {
  return (
    <Avatar
      model={{
        avatarUrl: model?.avatarUrl ?? null,
        color: model?.color ?? undefined,
        name: model?.name ?? initial,
        initial,
        id: model?.id,
      }}
      size={AvatarSize.Small}
    />
  );
}

function actorInitial(actor: User | undefined): string {
  const name = actor?.name;
  return (name?.charAt(0) ?? "?").toUpperCase();
}

function verbKey(name: string): string {
  switch (name) {
    case "documents.create":
      return "created the document";
    case "documents.publish":
      return "published the document";
    case "documents.unpublish":
      return "unpublished the document";
    case "documents.update":
      return "updated the document";
    case "documents.archive":
      return "archived the document";
    case "documents.unarchive":
      return "restored the document";
    case "documents.delete":
      return "deleted the document";
    case "documents.restore":
      return "restored the document";
    case "documents.move":
      return "moved the document";
    case "documents.add_user":
      return "added a collaborator";
    case "documents.remove_user":
      return "removed a collaborator";
    default:
      return name.replace("documents.", "");
  }
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < 0) {
    return "just now";
  }
  if (diff < minute) {
    return "just now";
  }
  if (diff < hour) {
    return `${Math.floor(diff / minute)}m ago`;
  }
  if (diff < day) {
    return `${Math.floor(diff / hour)}h ago`;
  }
  const days = Math.floor(diff / day);
  if (days < 30) {
    return `${days}d ago`;
  }
  return new Date(ts).toLocaleDateString();
}

const TabBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const ActivityList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
`;

const ActivityRow = styled.li<{ $isFirst?: boolean }>`
  list-style: none;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 6px 6px;
  border-radius: 6px;
  cursor: default;
  position: relative;

  &:hover {
    background: transparent;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 2px;
`;

const ActivityLine = styled.div`
  position: absolute;
  top: 24px;
  bottom: -4px;
  width: 1px;
  background: ${s("divider")};
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 1px;
`;

const ActivityVerb = styled.div`
  font-size: 12px;
  line-height: 1.4;
  color: ${s("textSecondary")};
  min-width: 0;
  word-break: break-word;
`;

const ActorName = styled.span`
  color: ${s("text")};
  font-weight: 500;
`;

const Verb = styled.span`
  color: ${s("textSecondary")};
`;

const ActivityMeta = styled.span`
  font-size: 10.5px;
  color: ${s("textTertiary")};
  font-variant-numeric: tabular-nums;
`;

const LoadingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 4px;
`;

const AvatarPlaceholder = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: ${s("sidebarHoverBackground")};
  flex-shrink: 0;
`;

const LoadingBar = styled.div`
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
    animation: shimmer 1.4s var(--ease-in-out, cubic-bezier(0.4, 0, 0.2, 1))
      infinite;
  }

  @keyframes shimmer {
    to {
      transform: translateX(100%);
    }
  }
`;

export default observer(ActivityTab);
