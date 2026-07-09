import { observer } from "mobx-react";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import {
  RELATIONSHIP_TYPE_LABELS,
  SEMANTIC_RELATIONSHIP_TYPES,
  type SemanticRelationshipType,
} from "@shared/types/relationships";
import Button from "~/components/Button";
import Flex from "@shared/components/Flex";
import Input from "~/components/Input";
import { InputSelect } from "~/components/InputSelect";
import Modal from "~/components/Modal";
import type Document from "~/models/Document";
import { client } from "~/utils/ApiClient";
import useStores from "~/hooks/useStores";

type Props = {
  /** Document the new edge originates from. */
  document: Document;
  /** Whether the dialog is currently open. */
  isOpen: boolean;
  /** Callback fired when the dialog is dismissed without submitting. */
  onClose: () => void;
  /** Callback fired after a successful create — used by the host to refresh. */
  onCreated?: () => void;
};

interface ApiSearchResult {
  id: string;
  title: string;
  emoji?: string | null;
  url?: string;
}

/**
 * Lightweight dialog for creating a typed edge from the current document
 * to another document. The dialog deliberately keeps the surface area
 * minimal — a doc picker, a type dropdown, and a free-text provenance
 * note.
 */
function AddRelationshipDialog({
  document,
  isOpen,
  onClose,
  onCreated,
}: Props) {
  const { t } = useTranslation();
  const { documents } = useStores();

  const [query, setQuery] = useState("");
  const [targetId, setTargetId] = useState<string | null>(null);
  const [edgeType, setEdgeType] =
    useState<SemanticRelationshipType>("supports");
  const [sourceNote, setSourceNote] = useState("");
  const [results, setResults] = useState<ApiSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state whenever the dialog is re-opened.
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTargetId(null);
      setEdgeType("supports");
      setSourceNote("");
      setError(null);
      setResults([]);
    }
  }, [isOpen]);

  const fetchCandidates = useCallback(
    async (q: string) => {
      const res = await client.post("/documents.search_titles", {
        query: q,
        limit: 8,
      });
      const list = (res?.data ?? []) as ApiSearchResult[];
      return list.filter((item) => item.id !== document.id);
    },
    [document.id]
  );

  // Lightweight search-as-you-type with a 200ms debounce.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    let cancelled = false;

    async function run(q: string) {
      setIsSearching(true);
      try {
        const list = await fetchCandidates(q);
        if (!cancelled) {
          setResults(list);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }

    const timer = setTimeout(() => {
      void run(query);
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [fetchCandidates, isOpen, query]);

  const selectedTarget = useMemo(
    () => results.find((item) => item.id === targetId) ?? null,
    [results, targetId]
  );

  const handleSubmit = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();
      if (!targetId) {
        setError(t("Pick a target document"));
        return;
      }
      if (targetId === document.id) {
        setError(t("Source and target must be different"));
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        await client.post("/relationships.create", {
          sourceDocumentId: document.id,
          targetDocumentId: targetId,
          type: edgeType,
          source: sourceNote.trim() || undefined,
        });

        // Refresh relationships for the originating document so the new
        // edge shows up immediately in the ConnectionsTab.
        void documents.fetchRelationships(document.id);
        onCreated?.();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      documents,
      document.id,
      edgeType,
      onClose,
      onCreated,
      sourceNote,
      t,
      targetId,
    ]
  );

  return (
    <Modal
      title={t("Link this document")}
      onRequestClose={onClose}
      isOpen={isOpen}
    >
      <Form id={`add-relationship-${document.id}`} onSubmit={handleSubmit}>
        <Field>
          <Label htmlFor="relationship-target">{t("Target document")}</Label>
          <Input
            id="relationship-target"
            value={query}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(event.target.value)
            }
            placeholder={t("Search by title…")}
            autoFocus
            autoComplete="off"
          />
          {results.length > 0 ? (
            <ResultList role="listbox">
              {results.map((item) => (
                <ResultRow
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={item.id === targetId}
                  data-selected={item.id === targetId}
                  onClick={() => {
                    setTargetId(item.id);
                    setQuery(item.title);
                  }}
                >
                  {item.emoji ? <ResultEmoji>{item.emoji}</ResultEmoji> : null}
                  <ResultTitle>{item.title}</ResultTitle>
                </ResultRow>
              ))}
            </ResultList>
          ) : isSearching ? (
            <Hint>{t("Searching…")}</Hint>
          ) : query.length > 0 ? (
            <Hint>{t("No documents match")}</Hint>
          ) : null}
          {selectedTarget ? (
            <SelectedPill>
              {t("Linking to:")} <strong>{selectedTarget.title}</strong>
            </SelectedPill>
          ) : null}
        </Field>

        <Field>
          <Label htmlFor="relationship-type">{t("Edge type")}</Label>
          <InputSelect
            value={edgeType}
            onChange={(value: string) =>
              setEdgeType(value as SemanticRelationshipType)
            }
            options={SEMANTIC_RELATIONSHIP_TYPES.map((type) => ({
              type: "item",
              label: RELATIONSHIP_TYPE_LABELS[type],
              value: type,
            }))}
            label={t("Edge type")}
            labelHidden
          />
        </Field>

        <Field>
          <Label htmlFor="relationship-source">{t("Source note")}</Label>
          <TextArea
            id="relationship-source"
            value={sourceNote}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
              setSourceNote(event.target.value)
            }
            placeholder={t("Why does this link exist?")}
            rows={3}
            maxLength={2000}
          />
          <Hint>{t("Optional — surfaced as the provenance of the edge.")}</Hint>
        </Field>

        {error ? <ErrorMessage>{error}</ErrorMessage> : null}

        <Footer align="right">
          <Button type="button" onClick={onClose} neutral>
            {t("Cancel")}
          </Button>
          <Button
            type="submit"
            form={`add-relationship-${document.id}`}
            disabled={!targetId || isSubmitting}
            primary
          >
            {isSubmitting ? t("Linking…") : t("Create link")}
          </Button>
        </Footer>
      </Form>
    </Modal>
  );
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
`;

const Label = styled.label`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

const TextArea = styled.textarea`
  width: 100%;
  resize: vertical;
  font-family: inherit;
  font-size: 13px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--background-secondary);
  color: var(--text);
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);

  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent);
  }
`;

const ResultList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 4px;
  border-radius: var(--radius-md);
  background: var(--background-secondary);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 220px;
  overflow-y: auto;
`;

const ResultRow = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: none;
  color: var(--text);
  text-align: left;
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);

  &:hover {
    background: var(--background-tertiary);
    transform: translateY(-1px);
  }

  &[data-selected="true"] {
    background: color-mix(in srgb, var(--accent) 14%, transparent);
  }
`;

const ResultEmoji = styled.span`
  font-size: 14px;
`;

const ResultTitle = styled.span`
  font-size: 13px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SelectedPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
`;

const Hint = styled.span`
  font-size: 11px;
  color: var(--text-tertiary);
`;

const ErrorMessage = styled.p`
  margin: 0;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: #c1352c;
  background: color-mix(in srgb, #ff3b30 12%, transparent);
`;

const Footer = styled(Flex)`
  gap: 8px;
`;

export default observer(AddRelationshipDialog);
