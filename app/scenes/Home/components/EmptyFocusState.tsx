import { observer } from "mobx-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import Button from "~/components/Button";
import useStores from "~/hooks/useStores";
import { ProsemirrorHelper } from "@shared/utils/ProsemirrorHelper";
import { documentEditPath } from "~/utils/routeHelpers";

/**
 * EmptyFocusState is shown when the current user has no documents at all. It
 * offers a single, text-only message and one primary action: create the first
 * document. No decorative illustration or emoji — text + button only.
 */
function EmptyFocusState() {
  const { documents, collections } = useStores();
  const history = useHistory();
  const { t } = useTranslation();

  const handleCreate = React.useCallback(async () => {
    // Resolve a sensible collectionId for the new doc: fall back to the team's
    // default collection, then to the first active collection, then to none.
    const collectionId = collections.orderedData[0]?.id ?? undefined;

    const doc = await documents.create(
      {
        collectionId,
        title: "",
        fullWidth: false,
        data: ProsemirrorHelper.getEmptyDocument(),
      },
      { publish: true }
    );

    history.push(documentEditPath(doc));
  }, [collections, documents, history]);

  return (
    <Container>
      <Message>{t("Your workspace is empty.")}</Message>
      <Hint>
        {t(
          "Create your first document to start capturing decisions, notes, and ideas."
        )}
      </Hint>
      <Actions>
        <Button onClick={handleCreate} type="button">
          {t("Create first document")}
        </Button>
      </Actions>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 64px 24px;
  text-align: center;
`;

const Message = styled.p`
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: ${(props) => props.theme.text};
`;

const Hint = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${(props) => props.theme.textTertiary};
  max-width: 420px;
`;

const Actions = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 8px;
`;

export default observer(EmptyFocusState);
