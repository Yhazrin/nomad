import { observer } from "mobx-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import useCurrentTeam from "~/hooks/useCurrentTeam";
import useCurrentUser from "~/hooks/useCurrentUser";
import useStores from "~/hooks/useStores";
import ContinueReadingCard from "./ContinueReadingCard";
import EmptyFocusState from "./EmptyFocusState";
import ProjectCard from "./ProjectCard";
import RecentActivityCard from "./RecentActivityCard";
import RecentDecisionsCard from "./RecentDecisionsCard";

/**
 * The FocusSurface is the main body of the Home scene. It replaces the legacy
 * tab list with a single, scrollable surface composed of focused sections:
 *
 *  - Current project (ProjectCard)
 *  - Continue reading (ContinueReadingCard)
 *  - Recent decisions (RecentDecisionsCard)
 *  - Recent activity (RecentActivityCard)
 *
 * All sections are driven by real store data — no decorative placeholders.
 *
 * @returns the rendered focus surface, or the empty focus state if no docs
 *   exist for the current user.
 */
function FocusSurface() {
  const { documents } = useStores();
  const team = useCurrentTeam();
  const user = useCurrentUser();
  const { t } = useTranslation();

  React.useEffect(() => {
    void documents.fetchRecentlyViewed({ limit: 5 });
    void documents.fetchRecentlyUpdated({ limit: 25 });
  }, [documents]);

  const greeting = user ? getGreeting(user.name, t) : t("Home");

  const hasAnyDocument = documents.all.length > 0;

  return (
    <Surface aria-label={t("Focus surface")}>
      <Header>
        <Greeting>{greeting}</Greeting>
        {team?.name ? <ProjectName>{team.name}</ProjectName> : null}
      </Header>
      {hasAnyDocument ? (
        <Sections>
          <ProjectCard />
          <ContinueReadingCard />
          <RecentDecisionsCard />
          <RecentActivityCard />
        </Sections>
      ) : (
        <EmptyFocusState />
      )}
    </Surface>
  );
}

/**
 * Returns a localized greeting addressed to the given name.
 *
 * @param name the current user's display name.
 * @param t the translation function.
 * @returns a friendly greeting.
 */
function getGreeting(name: string | undefined, t: (key: string) => string) {
  const hour = new Date().getHours();
  const slot =
    hour < 5
      ? t("Good evening")
      : hour < 12
        ? t("Good morning")
        : hour < 18
          ? t("Good afternoon")
          : t("Good evening");
  return name ? `${slot}, ${name.split(" ")[0]}` : slot;
}

const Surface = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 0 64px;
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 4px 0;
`;

const Greeting = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: ${(props) => props.theme.text};
`;

const ProjectName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => props.theme.textTertiary};
  letter-spacing: -0.005em;
`;

const Sections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export default observer(FocusSurface);
