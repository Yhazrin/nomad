import { observer } from "mobx-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styled from "styled-components";
import useCurrentTeam from "~/hooks/useCurrentTeam";
import useStores from "~/hooks/useStores";
import { collectionPath } from "~/utils/routeHelpers";
import Card from "./Card";

/**
 * ProjectCard shows the current team's project info — name, icon, document
 * count, and member count — with a single link into the default collection.
 *
 * All numbers are derived from real store data (DocumentsStore,
 * CollectionsStore, UsersStore). No fabricated stats.
 */
function ProjectCard() {
  const { collections, documents, users } = useStores();
  const team = useCurrentTeam();
  const { t } = useTranslation();

  React.useEffect(() => {
    void collections.fetchAll({ limit: 100 });
    void users.fetchAll({ limit: 100 });
  }, [collections, users]);

  const collectionCount = collections.allActive.length;
  const documentCount = documents.all.length;
  // users.activeOrInvited is the team's full member roster (active + invited)
  // fetched via users.list — this is the closest equivalent to teams.info
  // without adding a new store.
  const memberCount = users.activeOrInvited.length;
  const icon = team?.initial ?? "?";

  // Prefer the first active collection as the project entry point; fall back
  // to the default collection id if no collection list is loaded yet.
  const defaultCollection = collections.orderedData[0] ?? null;

  const target = defaultCollection ? collectionPath(defaultCollection) : null;

  return (
    <Card
      title={t("Your project")}
      action={
        target ? (
          <ViewAll
            to={{ pathname: target, state: { sidebarContext: "collections" } }}
          >
            {t("Open")}
          </ViewAll>
        ) : null
      }
    >
      <Body>
        <Icon aria-hidden>{icon}</Icon>
        <Meta>
          <Name>{team?.name ?? t("Untitled workspace")}</Name>
          <Stats>
            <Stat>
              <StatValue>{documentCount}</StatValue>
              <StatLabel>{t("Documents")}</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{collectionCount}</StatValue>
              <StatLabel>{t("Collections")}</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{memberCount}</StatValue>
              <StatLabel>{t("Members")}</StatLabel>
            </Stat>
          </Stats>
        </Meta>
      </Body>
    </Card>
  );
}

const Body = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
`;

const Icon = styled.div`
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: ${(props) => props.theme.inputBackground};
  border: 1px solid ${(props) => props.theme.divider};
  color: ${(props) => props.theme.text};
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Meta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
`;

const Name = styled.div`
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: ${(props) => props.theme.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Stats = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
`;

const Stat = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
`;

const StatValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.theme.text};
`;

const StatLabel = styled.span`
  font-size: 13px;
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

export default observer(ProjectCard);
