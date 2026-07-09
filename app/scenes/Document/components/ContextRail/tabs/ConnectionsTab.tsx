import { observer } from "mobx-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { InspectorEmptyState } from "@shared/styles/inspector";
import type Document from "~/models/Document";
import Flex from "@shared/components/Flex";
import { s, ellipsis } from "@shared/styles";
import { IconType } from "@shared/types";
import { determineIconType } from "@shared/utils/icon";
import {
  RELATIONSHIP_TYPE_LABELS,
  SEMANTIC_RELATIONSHIP_TYPES,
  type RelationshipEdge,
  type SemanticRelationshipType,
} from "@shared/types/relationships";
import { DocumentIcon } from "outline-icons";
import { useLocationSidebarContext } from "~/hooks/useLocationSidebarContext";
import useStores from "~/hooks/useStores";
import type { SidebarContextType } from "~/components/Sidebar/components/SidebarContext";
import { determineSidebarContext } from "~/components/Sidebar/components/SidebarContext";
import useCurrentUser from "~/hooks/useCurrentUser";
import { client } from "~/utils/ApiClient";
import { decodeURIComponentSafe } from "~/utils/urls";

type ConnectionKind =
  | "children"
  | "backlinks"
  | "similar"
  | SemanticRelationshipType;

type ConnectionItem = {
  id: string;
  title: string;
  emoji?: string;
  updatedAt: Date | string | null | undefined;
  url: string;
  anchor?: string;
  document: Document;
  sidebarContext?: SidebarContextType;
  edge?: {
    type: SemanticRelationshipType;
    source: string | null;
    createdAt: string;
    createdById: string;
    direction: "outgoing" | "incoming";
  };
};

type SectionProps = {
  title: React.ReactNode;
  items: ConnectionItem[];
  emptyHint?: string;
  onNavigate: (item: ConnectionItem) => void;
};

function Section({ title, items, emptyHint, onNavigate }: SectionProps) {
  const { t } = useTranslation();

  return (
    <SectionWrapper>
      <SectionHeading>{title}</SectionHeading>
      {items.length === 0 ? (
        <SectionEmpty>{emptyHint ?? t("Nothing to show yet")}</SectionEmpty>
      ) : (
        <SectionList>
          {items.map((item) => (
            <RowItem as="li" key={item.id} onClick={() => onNavigate(item)}>
              <DocumentRowItem item={item} />
            </RowItem>
          ))}
        </SectionList>
      )}
    </SectionWrapper>
  );
}

function DocumentRowItem({ item }: { item: ConnectionItem }) {
  const { t } = useTranslation();
  const title = useMemo(() => stripEmoji(item.title, item.emoji), [item]);

  return (
    <RowInner dir="auto">
      {item.edge ? (
        <EdgeTypePill data-type={item.edge.type}>
          {RELATIONSHIP_TYPE_LABELS[item.edge.type]}
        </EdgeTypePill>
      ) : item.emoji && item.emoji.length > 0 ? (
        <DocumentEmoji>{item.emoji}</DocumentEmoji>
      ) : (
        <FallbackIcon>
          <DocumentIcon size={14} />
        </FallbackIcon>
      )}
      <TitleBlock>
        <TitleLine>
          <TitleText title={title}>{title}</TitleText>
        </TitleLine>
        <Meta>
          {item.edge ? (
            <>
              <EdgeMetaPill data-direction={item.edge.direction}>
                {item.edge.direction === "outgoing"
                  ? t("Outgoing")
                  : t("Incoming")}
              </EdgeMetaPill>
              {item.updatedAt ? (
                <MetaText>{formatRelative(item.updatedAt)}</MetaText>
              ) : null}
            </>
          ) : item.updatedAt ? (
            <MetaText>{formatRelative(item.updatedAt)}</MetaText>
          ) : null}
        </Meta>
        {item.edge?.source ? (
          <EdgeNote title={item.edge.source}>{item.edge.source}</EdgeNote>
        ) : null}
      </TitleBlock>
    </RowInner>
  );
}

function ConnectionSectionTitle({
  kind,
  count,
}: {
  kind: ConnectionKind;
  count: number;
}) {
  if (kind === "children") {
    return (
      <>
        Children <SectionCount>{count}</SectionCount>
      </>
    );
  }
  if (kind === "backlinks") {
    return (
      <>
        Backlinks <SectionCount>{count}</SectionCount>
      </>
    );
  }
  if (kind === "similar") {
    return (
      <>
        Similar <SectionCount>{count}</SectionCount>
      </>
    );
  }
  return (
    <>
      Linked as {RELATIONSHIP_TYPE_LABELS[kind]}{" "}
      <SectionCount>{count}</SectionCount>
    </>
  );
}

type Props = {
  document: Document;
};

function ConnectionsTab({ document }: Props) {
  const { t } = useTranslation();
  const history = useHistory();
  const user = useCurrentUser({ rejectOnEmpty: false });
  const { documents } = useStores();
  const locationSidebarContext = useLocationSidebarContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [semanticEdges, setSemanticEdges] = useState<RelationshipEdge[]>([]);

  const fetchSemanticEdges = useCallback(async (documentId: string) => {
    const res = await client.post("/relationships.list", { documentId });
    const all = (res?.data?.relationships ?? []) as RelationshipEdge[];
    return all.filter((edge) =>
      SEMANTIC_RELATIONSHIP_TYPES.includes(
        edge.type as SemanticRelationshipType
      )
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [, , edges] = await Promise.all([
          documents.fetchChildDocuments(document.id),
          documents.fetchRelationships(document.id),
          fetchSemanticEdges(document.id),
        ]);
        if (!cancelled) {
          setSemanticEdges(edges);
        }
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
    return () => {
      cancelled = true;
    };
  }, [documents, document.id, fetchSemanticEdges]);

  const children = useMemo(
    () => orderedByUpdate(documents.getChildDocuments(document.id)),
    [documents, document.id]
  );
  const backlinks = useMemo(
    () => documents.getBacklinkedDocuments(document.id),
    [documents, document.id]
  );
  const similar = useMemo(
    () => documents.getSimilarDocuments(document.id),
    [documents, document.id]
  );

  const semanticEdgesByType = useMemo(() => {
    const grouped = new Map<SemanticRelationshipType, ConnectionItem[]>();
    for (const type of SEMANTIC_RELATIONSHIP_TYPES) {
      grouped.set(type, []);
    }
    for (const edge of semanticEdges) {
      const edgeType = edge.type as SemanticRelationshipType;
      if (!SEMANTIC_RELATIONSHIP_TYPES.includes(edgeType)) {
        continue;
      }
      const isOutgoing = edge.sourceDocumentId === document.id;
      const otherId = isOutgoing
        ? edge.targetDocumentId
        : edge.sourceDocumentId;
      const other = documents.get(otherId);
      if (!other) {
        continue;
      }
      grouped.get(edgeType)?.push({
        id: edge.id,
        title: other.titleWithDefault,
        emoji: isEmoji(other.icon) ? (other.icon ?? undefined) : undefined,
        updatedAt: edge.createdAt,
        url: other.url,
        document: other,
        sidebarContext: locationSidebarContext,
        edge: {
          type: edgeType,
          source: edge.source ?? null,
          createdAt: edge.createdAt,
          createdById: edge.createdById,
          direction: isOutgoing ? "outgoing" : "incoming",
        },
      });
    }
    return grouped;
  }, [documents, document.id, locationSidebarContext, semanticEdges]);

  const buildChildItem = (child: Document): ConnectionItem => ({
    id: child.id,
    title: child.titleWithDefault,
    emoji: isEmoji(child.icon) ? (child.icon ?? undefined) : undefined,
    updatedAt: child.updatedAt,
    url: child.url,
    document: child,
    sidebarContext: locationSidebarContext,
  });

  const buildBacklinkItem = (doc: Document): ConnectionItem => {
    const computed = user
      ? determineSidebarContext({
          document: doc,
          user,
          currentContext: locationSidebarContext,
        })
      : locationSidebarContext;
    return {
      id: doc.id,
      title: doc.titleWithDefault,
      emoji: isEmoji(doc.icon) ? (doc.icon ?? undefined) : undefined,
      updatedAt: doc.updatedAt,
      url: doc.url,
      document: doc,
      sidebarContext: computed,
    };
  };

  const buildSimilarItem = (doc: Document): ConnectionItem => ({
    id: doc.id,
    title: doc.titleWithDefault,
    emoji: isEmoji(doc.icon) ? (doc.icon ?? undefined) : undefined,
    updatedAt: doc.updatedAt,
    url: doc.url,
    document: doc,
    sidebarContext: locationSidebarContext,
  });

  const handleNavigate = (item: ConnectionItem) => {
    history.push({
      pathname: item.url,
      hash: item.anchor
        ? `d-${decodeURIComponentSafe(item.anchor)}`
        : undefined,
      state: {
        title: item.document.title,
        sidebarContext: item.sidebarContext,
      },
    });
  };

  if (isLoading) {
    return (
      <TabBody>
        {[0, 1, 2, 3].map((i) => (
          <LoadingRow key={i}>
            <LoadingBar style={{ width: "70%" }} />
            <LoadingBar style={{ width: "40%" }} />
          </LoadingRow>
        ))}
      </TabBody>
    );
  }

  if (error) {
    return (
      <InspectorEmptyState>
        {t("Could not load connections: {{message}}", {
          message: error.message,
        })}
      </InspectorEmptyState>
    );
  }

  const totalSemantic = Array.from(semanticEdgesByType.values()).reduce(
    (sum, list) => sum + list.length,
    0
  );
  const total =
    children.length + backlinks.length + similar.length + totalSemantic;

  if (total === 0) {
    return (
      <InspectorEmptyState>{t("Nothing to show yet.")}</InspectorEmptyState>
    );
  }

  return (
    <TabBody>
      {children.length > 0 && (
        <Section
          title={
            <ConnectionSectionTitle kind="children" count={children.length} />
          }
          items={children.map(buildChildItem)}
          onNavigate={handleNavigate}
        />
      )}
      {backlinks.length > 0 && (
        <Section
          title={
            <ConnectionSectionTitle kind="backlinks" count={backlinks.length} />
          }
          items={backlinks.map(buildBacklinkItem)}
          onNavigate={handleNavigate}
        />
      )}
      {similar.length > 0 && (
        <Section
          title={
            <ConnectionSectionTitle kind="similar" count={similar.length} />
          }
          items={similar.map(buildSimilarItem)}
          onNavigate={handleNavigate}
        />
      )}
      {SEMANTIC_RELATIONSHIP_TYPES.map((type) => {
        const items = semanticEdgesByType.get(type) ?? [];
        if (items.length === 0) {
          return null;
        }
        return (
          <Section
            key={type}
            title={<ConnectionSectionTitle kind={type} count={items.length} />}
            items={items}
            onNavigate={handleNavigate}
          />
        );
      })}
    </TabBody>
  );
}

function orderedByUpdate(docs: Document[]): Document[] {
  return [...docs].sort((a, b) => {
    const at = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bt = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bt - at;
  });
}

function isEmoji(icon: string | null | undefined): boolean {
  if (!icon) {
    return false;
  }
  return determineIconType(icon) === IconType.Emoji;
}

function stripEmoji(title: string, emoji?: string): string {
  if (!emoji || !title.startsWith(emoji)) {
    return title;
  }
  return title.slice(emoji.length).trim() || title;
}

function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = Date.now();
  const diff = now - d.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) {
    return "just now";
  }
  if (diff < hour) {
    const m = Math.floor(diff / minute);
    return `${m}m`;
  }
  if (diff < day) {
    const h = Math.floor(diff / hour);
    return `${h}h`;
  }
  const days = Math.floor(diff / day);
  if (days < 30) {
    return `${days}d`;
  }
  return d.toLocaleDateString();
}

const TabBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const SectionWrapper = styled.section`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SectionHeading = styled.h4`
  margin: 0 0 4px;
  padding: 0 8px;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${s("textTertiary")};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SectionCount = styled.span`
  font-weight: 500;
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  color: ${s("textTertiary")};
  letter-spacing: 0.04em;
  background: ${s("sidebarHoverBackground")};
  border-radius: var(--radius-pill, 999px);
  padding: 1px 6px;
`;

const SectionList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const SectionEmpty = styled.div`
  margin: 2px 8px 4px;
  font-size: 11.5px;
  color: ${s("textTertiary")};
`;

const RowInner = styled(Flex)`
  min-width: 0;
  width: 100%;
  align-items: center;
  gap: 8px;
`;

const RowItem = styled.li`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 10px;
  border-radius: var(--radius-sm, 6px);
  transition:
    background var(--duration-fast, 160ms)
      var(--ease-out, cubic-bezier(0.32, 0.72, 0, 1)),
    transform var(--duration-fast, 160ms)
      var(--ease-out, cubic-bezier(0.32, 0.72, 0, 1));

  &:hover {
    background: ${s("sidebarHoverBackground")};
    transform: translateY(-1px);
  }
`;

const TitleBlock = styled.div`
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TitleLine = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
`;

const TitleText = styled.span`
  ${ellipsis()}
  font-size: 12.5px;
  font-weight: 500;
  color: ${s("text")};
  line-height: 1.3;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const MetaText = styled.span`
  font-size: 10.5px;
  color: ${s("textTertiary")};
  font-variant-numeric: tabular-nums;
`;

const EdgeTypePill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 7px;
  border-radius: var(--radius-pill, 999px);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  flex-shrink: 0;
  background: color-mix(in srgb, ${s("accent")} 14%, transparent);
  color: ${s("accent")};

  &[data-type="supports"] {
    background: color-mix(in srgb, ${s("accent")} 14%, transparent);
    color: ${s("accent")};
  }
  &[data-type="decides"] {
    background: color-mix(in srgb, #5856d6 14%, transparent);
    color: #5856d6;
  }
  &[data-type="depends_on"] {
    background: color-mix(in srgb, #ff9500 14%, transparent);
    color: #b35900;
  }
  &[data-type="source_for"] {
    background: color-mix(in srgb, #34c759 14%, transparent);
    color: #1f7a3a;
  }
  &[data-type="supersedes"] {
    background: color-mix(in srgb, #ff3b30 14%, transparent);
    color: #c1352c;
  }
`;

const EdgeMetaPill = styled.span`
  font-size: 9.5px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${s("textTertiary")};
  background: ${s("sidebarHoverBackground")};
  border-radius: var(--radius-pill, 999px);
  padding: 1px 6px;
`;

const EdgeNote = styled.span`
  ${ellipsis()}
  font-size: 11px;
  color: ${s("textSecondary")};
  font-style: italic;
`;

const DocumentEmoji = styled.span`
  font-size: 14px;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const FallbackIcon = styled.span`
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: ${s("inputBackground")};
  color: ${s("textTertiary")};
  flex-shrink: 0;
`;

const LoadingRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 4px;
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

export default observer(ConnectionsTab);
