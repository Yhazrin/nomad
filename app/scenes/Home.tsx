import { observer } from "mobx-react";
import { HomeIcon } from "outline-icons";
import * as React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { s } from "@shared/styles";
import { Action } from "~/components/Actions";
import LanguagePrompt from "~/components/LanguagePrompt";
import InputSearchPage from "~/components/InputSearchPage";
import { ResizingHeightContainer } from "~/components/ResizingHeightContainer";
import Scene from "~/components/Scene";
import useStores from "~/hooks/useStores";
import NewDocumentMenu from "~/menus/NewDocumentMenu";
import FocusSurface from "./Home/components/FocusSurface";

/**
 * Home is the post-Phase-3 focus surface — a single scrollable canvas with
 * project info, continue-reading, recent decisions, and recent activity. It
 * replaces the legacy "recent docs tab list" while preserving the existing
 * Scene shell, search header, and new-document action.
 */
function Home() {
  const { ui } = useStores();
  const { t } = useTranslation();

  return (
    <Scene
      icon={<HomeIcon />}
      title={t("Home")}
      left={
        <InputSearchPage source="dashboard" label={t("Search documents")} />
      }
      actions={
        <Action>
          <NewDocumentMenu />
        </Action>
      }
    >
      <ResizingHeightContainer>
        {!ui.languagePromptDismissed && <LanguagePrompt key="language" />}
      </ResizingHeightContainer>
      <FocusSurfaceWrapper>
        <FocusSurface />
      </FocusSurfaceWrapper>
    </Scene>
  );
}

const FocusSurfaceWrapper = styled.div`
  background: ${s("background")};
  width: 100%;
  padding: 0 32px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

export default observer(Home);
