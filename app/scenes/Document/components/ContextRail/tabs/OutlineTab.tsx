import { observer } from "mobx-react";
import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { InspectorEmptyState } from "@shared/styles/inspector";
import { EmojiText } from "@shared/components/EmojiText";
import { s } from "@shared/styles";
import { useDocumentContext } from "~/components/DocumentContext";
import type Document from "~/models/Document";
import { decodeURIComponentSafe } from "~/utils/urls";
import { patchLocation } from "~/utils/history";

const HEADING_OFFSET = 80;

type Props = {
  document: Document;
};

function OutlineTab({ document }: Props) {
  const { t } = useTranslation();
  const { headings } = useDocumentContext();
  const history = useHistory();

  const [activeId, setActiveId] = useState<string | undefined>(
    () => headings[0]?.id
  );

  // Reset active heading when the document changes (the headings array
  // is updated by DocumentContext when navigating between documents).
  useEffect(() => {
    setActiveId(headings[0]?.id);
  }, [document.id, headings]);

  // Compute the rendering adjustments — flatten by skipping leading H1
  // blocks if all top level headings are h2 / h3.
  const minLevel = useMemo(() => {
    if (headings.length === 0) {
      return 1;
    }
    return headings.reduce(
      (min, h) => (h.level < min ? h.level : min),
      Infinity
    );
  }, [headings]);

  // Track current heading via scroll position + intersection.
  const lastObservedRef = useRef<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || headings.length === 0) {
      return;
    }

    const elements: HTMLElement[] = [];

    for (const h of headings) {
      const el = window.document.getElementById(decodeURIComponentSafe(h.id));
      if (el) {
        elements.push(el);
      }
    }

    if (elements.length === 0) {
      return;
    }

    const visible = new Set<string>();

    const handleIntersect: IntersectionObserverCallback = () => {
      // Promote all intersecting headings to "visible"
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom >= HEADING_OFFSET && rect.top <= window.innerHeight) {
          visible.add(el.id);
        } else {
          visible.delete(el.id);
        }
      }
      lastObservedRef.current = visible;

      // Pick the "active" heading: the one closest to the offset but above it.
      let candidate: string | undefined;
      let closestAbove = -Infinity;

      for (const h of headings) {
        const el = window.document.getElementById(decodeURIComponentSafe(h.id));
        if (!el) {
          continue;
        }
        const top = el.getBoundingClientRect().top;
        if (top <= HEADING_OFFSET && top > closestAbove) {
          closestAbove = top;
          candidate = h.id;
        }
      }

      if (!candidate) {
        candidate = headings[0].id;
      }

      setActiveId((prev) => (prev === candidate ? prev : candidate));
    };

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: `-${HEADING_OFFSET}px 0px -70% 0px`,
      threshold: [0, 1],
    });

    for (const el of elements) {
      observer.observe(el);
    }

    // Initial pass for SSR / pre-paint state.
    handleIntersect(
      elements.map((el) => ({
        target: el,
        isIntersecting: true,
        intersectionRatio: 1,
        boundingClientRect: el.getBoundingClientRect(),
        intersectionRect: el.getBoundingClientRect(),
        rootBounds: null,
        time: Date.now(),
      })) as unknown as IntersectionObserverEntry[],
      observer
    );

    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [headings]);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>, id: string) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      event.preventDefault();
      history.push(patchLocation(history.location, { hash: `#${id}` }));

      // Set immediately to avoid scroll-jank while the route hash is
      // resolved by the browser.
      setActiveId(id);

      const el = window.document.getElementById(decodeURIComponentSafe(id));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [history]
  );

  if (headings.length === 0) {
    return (
      <InspectorEmptyState>
        {t(
          "No headings yet — add a heading in the document to see an outline."
        )}
      </InspectorEmptyState>
    );
  }

  return (
    <TabBody>
      <Heading>{t("Outline")}</Heading>
      <List>
        {headings.map((heading) => {
          const indent = (heading.level - minLevel) * 12;
          const isActive = activeId === heading.id;
          return (
            <ListItem
              key={heading.id}
              $indent={indent}
              onClick={(event) => handleClick(event, heading.id)}
            >
              <Link
                href={`#${heading.id}`}
                $active={isActive}
                onClick={(event) => handleClick(event, heading.id)}
                aria-current={isActive ? "true" : undefined}
              >
                <HeadingLevelBadge $active={isActive} aria-hidden>
                  H{heading.level}
                </HeadingLevelBadge>
                <EmojiText>{heading.title}</EmojiText>
              </Link>
            </ListItem>
          );
        })}
      </List>
    </TabBody>
  );
}

const TabBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Heading = styled.h4`
  margin: 0 0 4px;
  padding: 0 8px;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${s("textTertiary")};
`;

const List = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const ListItem = styled.li<{ $indent: number }>`
  padding-left: ${(props) => props.$indent}px;
  cursor: var(--pointer);
`;

const Link = styled.a<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  margin: 0 -8px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: ${(props) => (props.$active ? 500 : 400)};
  color: ${(props) => (props.$active ? s("text") : s("textSecondary"))};
  background: ${(props) =>
    props.$active ? s("listItemHoverBackground") : "transparent"};
  transition:
    background var(--duration-fast, 160ms)
      var(--ease-out, cubic-bezier(0.32, 0.72, 0, 1)),
    color var(--duration-fast, 160ms)
      var(--ease-out, cubic-bezier(0.32, 0.72, 0, 1));
  text-decoration: none;
  line-height: 1.35;
  min-width: 0;
  cursor: var(--pointer);

  &:hover {
    background: ${s("listItemHoverBackground")};
    color: ${s("text")};
  }

  &:active {
    transform: scale(0.985);
  }
`;

const HeadingLevelBadge = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 16px;
  padding: 0 4px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
  background: ${(props) =>
    props.$active ? s("sidebarActiveBackground") : s("inputBackground")};
  color: ${(props) => (props.$active ? s("text") : s("textTertiary"))};
  flex-shrink: 0;
`;

export default observer(OutlineTab);
