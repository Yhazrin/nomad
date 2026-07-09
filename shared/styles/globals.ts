import { createGlobalStyle } from "styled-components";
import styledNormalize from "styled-normalize";
import { breakpoints, depths, s } from ".";
import { EditorStyleHelper } from "../editor/styles/EditorStyleHelper";

type Props = {
  staticHTML?: boolean;
  useCursorPointer?: boolean;
};

export default createGlobalStyle<Props>`
  ${styledNormalize}

  * {
    box-sizing: border-box;
  }

  html {
    --line-height-body: 1.5;
    --font-size-body: 16px;

    /* ── Motion tokens (Apple-style springs) ─────────────────────── */
    /* Use these in CSS: transition: all var(--ease-out) var(--duration); */
    --ease-out: cubic-bezier(0.32, 0.72, 0, 1);
    --ease-in: cubic-bezier(0.4, 0, 1, 1);
    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
    --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    --duration-fast: 160ms;
    --duration: 260ms;
    --duration-slow: 420ms;

    /* ── Squircle radius scale (Apple proportions) ──────────────── */
    --radius-xs: 6px;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 18px;
    --radius-xl: 24px;
    --radius-pill: 999px;

    /* ── Soft, multi-layer ambient shadows ───────────────────────── */
    --shadow-1: 0 1px 2px rgba(15, 23, 42, 0.04),
      0 1px 3px rgba(15, 23, 42, 0.06);
    --shadow-2: 0 2px 4px rgba(15, 23, 42, 0.04),
      0 4px 12px rgba(15, 23, 42, 0.06);
    --shadow-3: 0 4px 8px rgba(15, 23, 42, 0.04),
      0 12px 32px rgba(15, 23, 42, 0.08);
    --shadow-4: 0 8px 16px rgba(15, 23, 42, 0.06),
      0 24px 56px rgba(15, 23, 42, 0.12);
  }

  html,
  body {
    width: 100%;
    ${(props) => (props.staticHTML ? "" : "height: 100%;")}
    margin: 0;
    padding: 0;
    print-color-adjust: exact;
    --pointer: ${(props) => (props.useCursorPointer ? "pointer" : "default")};
    --scrollbar-width: calc(100vw - 100cqw);
    overscroll-behavior-x: none;

    @media print {
      background: none !important;
    }

    --line-height-p: var(--line-height-body);
    --line-height-h: 1.25;
  }

  body,
  button,
  input,
  optgroup,
  select,
  textarea {
    font-family: ${s("fontFamily")};
  }

  body {
    font-size: var(--font-size-body);
    line-height: var(--line-height-body);
    color: ${s("text")};
    overscroll-behavior-y: none;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    /* Slightly tighter letter-spacing for the Inter font at body sizes,
       gives the page a more refined, "designed" feel. */
    letter-spacing: -0.011em;

    ${(props) => (props.staticHTML ? "" : "width: 100vw;")}
    overflow-x: hidden;
    padding-right: calc(0 - var(--removed-body-scroll-bar-size)) !important;
  }

  /* Soft, refined focus ring — replaces browser default sharp blue outline */
  :focus-visible {
    outline: 2px solid ${s("accent")};
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  /* Smooth out any element that opts into a transition */
  * {
    transition-timing-function: var(--ease-out);
  }

  @media (min-width: ${breakpoints.tablet}px) {
    html,
    body {
      min-height: ${(props) => (props.staticHTML ? "0" : "100vh")};
    }
  }

  @media (min-width: ${breakpoints.tablet}px) and (display-mode: standalone) {
    body:after {
      content: "";
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: ${(props) => props.theme.titleBarDivider};
      z-index: ${depths.titleBarDivider};
    }
  }

  a {
    color: ${(props) => props.theme.link};
    text-decoration: none;
    cursor: pointer;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-weight: 500;
    line-height: var(--line-height-h);
    margin-top: 1em;
    margin-bottom: 0.5em;
  }
  h1 { font-size: 36px; }
  h2 { font-size: 26px; }
  h3 { font-size: 20px; }
  h4 { font-size: 18px; }
  h5 { font-size: 16px; }

  p,
  dl,
  ol,
  ul,
  pre,
  blockquote {
    margin-top: 1em;
    margin-bottom: 1em;
  }

  hr {
    border: 0;
    height: 0;
    border-top: 1px solid ${s("divider")};
  }

  :focus-visible {
    outline-color: ${s("accent")};
    outline-offset: -1px;
    outline-width: initial;
  }

  :root {
    --sat: env(safe-area-inset-top);
    --sar: env(safe-area-inset-right);
    --sab: env(safe-area-inset-bottom);
    --sal: env(safe-area-inset-left);
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Mermaid.js injects these into the root of the page. It's very annoying, but we have to deal with it or they affect layout */
  [id^="doffscreen-mermaid"] {
      position: absolute !important;
      left: -9999px !important;
      top: -9999px !important;
  }

  /* Table row/column drag and drop cursor */
  &.${EditorStyleHelper.tableDragging},
  &.${EditorStyleHelper.tableDragging} *,
  &.${EditorStyleHelper.tableDragging} *::before,
  &.${EditorStyleHelper.tableDragging} *::after {
    cursor: grabbing !important;
  }

  /* Image/media resize drag cursor */
  &.${EditorStyleHelper.resizeDragging},
  &.${EditorStyleHelper.resizeDragging} *,
  &.${EditorStyleHelper.resizeDragging} *::before,
  &.${EditorStyleHelper.resizeDragging} *::after {
    cursor: var(--resize-drag-cursor) !important;
  }
`;
