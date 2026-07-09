import { darken, lighten, transparentize } from "polished";
import type { DefaultTheme, Colors } from "styled-components";
import breakpoints from "./breakpoints";

const defaultColors: Colors = {
  transparent: "transparent",
  almostBlack: "#111319",
  lightBlack: "#2F3336",
  almostWhite: "#E6E6E6",
  veryDarkBlue: "#08090C",
  slate: "#66778F",
  slateLight: "#DAE1E9",
  slateDark: "#394351",
  smoke: "#F4F7FA",
  smokeLight: "#F9FBFC",
  smokeDark: "#E8EBED",
  white: "#FFFFFF",
  white05: "rgba(255, 255, 255, 0.05)",
  white10: "rgba(255, 255, 255, 0.1)",
  white50: "rgba(255, 255, 255, 0.5)",
  white75: "rgba(255, 255, 255, 0.75)",
  black: "#000",
  black05: "rgba(0, 0, 0, 0.05)",
  black10: "rgba(0, 0, 0, 0.1)",
  black50: "rgba(0, 0, 0, 0.50)",
  black75: "rgba(0, 0, 0, 0.75)",
  // Apple-inspired accent: a refined, slightly desaturated system blue
  accent: "#0A84FF",
  yellow: "#EDBA07",
  warmGrey: "hsl(212 31% 95% / 1)",
  danger: "#ed2651",
  warning: "#f08a24",
  success: "#3ad984",
  info: "#a0d3e8",
  brand: {
    red: "#FF5C80",
    pink: "#FF4DFA",
    purple: "#9E5CF7",
    blue: "#3633FF",
    marine: "#2BC2FF",
    dusk: "#2930FF",
    green: "#3ad984",
    yellow: "#F5BE31",
  },
};

const spacing = {
  sidebarWidth: 260,
  sidebarRightWidth: 300,
  // A compact rail keeps the sidebar discoverable without leaving part of the
  // navigation panel exposed when it is collapsed.
  sidebarCollapsedWidth: 44,
  sidebarMinWidth: 200,
  sidebarMaxWidth: 600,
};

// Apple-style motion: gentle springs that simulate mass.
// Use these via `theme.ease` / `theme.duration` instead of `ease-out`.
const motion = {
  // Apple's signature easing curve — used for sheets, modals, page transitions
  easeOut: "cubic-bezier(0.32, 0.72, 0, 1)",
  // For elements entering the viewport
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  // Symmetric — for state changes that go both ways (toggle, hover)
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  // Spring overshoot for delight micro-interactions (sparingly)
  easeSpring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  // Durations tuned for "snappy but not jarring"
  durationFast: "160ms",
  duration: "260ms",
  durationSlow: "420ms",
};

// Squircle-inspired radius scale. Apple uses ~22% of height for buttons;
// we follow that ratio so corners feel right at every size.
const radius = {
  xs: "6px",
  sm: "8px",
  md: "12px",
  lg: "18px",
  xl: "24px",
  pill: "999px",
};

const buildBaseTheme = (input: Partial<Colors>) => {
  const colors = {
    ...defaultColors,
    ...input,
  };

  return {
    fontFamily:
      '"Geist Variable", "Geist Fallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, sans-serif',
    fontFamilyMono:
      '"Geist Mono Variable", "Geist Mono Fallback", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
    fontFamilyEmoji:
      "Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Segoe UI, Twemoji Mozilla, Noto Color Emoji, Android Emoji",
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    accentText: colors.white,
    selected: colors.accent,
    textHighlight: "#FDEA9B",
    textHighlightForeground: colors.almostBlack,
    commentMarkBackground: transparentize(0.5, colors.brand.marine),
    commentedImageOutlineDark: colors.brand.marine,
    commentedImageOutlineLight: transparentize(0.7, colors.brand.marine),
    code: colors.lightBlack,
    codeComment: "#008000",
    codePunctuation: "#393a34",
    codeNumber: "#0550ae",
    codeProperty: "#ff0000",
    codeTag: "#800000",
    codeClassName: "#00578a",
    codeString: "#a31515",
    codeSelector: "#800000",
    codeAttrName: "#ff0000",
    codeAttrValue: colors.lightBlack,
    codeEntity: "#ff0000",
    codeKeyword: "#00009f",
    codeFunction: "#393A34",
    codeStatement: "#ff0000",
    codePlaceholder: "#3d8fd1",
    codeInserted: "#0550ae",
    codeImportant: "#e90e90",
    codeConstant: "#0550ae",
    codeParameter: colors.lightBlack,
    codeOperator: "#393a34",
    noticeInfoBackground: colors.brand.blue,
    noticeInfoText: colors.almostBlack,
    noticeTipBackground: "#f5be31",
    noticeTipText: colors.almostBlack,
    noticeWarningBackground: "#d73a49",
    noticeWarningText: colors.almostBlack,
    noticeSuccessBackground: colors.brand.green,
    noticeSuccessText: colors.almostBlack,
    tableSelectedBackground: transparentize(0.9, colors.accent),
    breakpoints,
    // Squircle radius scale (Apple proportions)
    radius,
    // Spring-based motion tokens
    ...motion,
    ...colors,
    ...spacing,
  };
};

export const buildLightTheme = (input: Partial<Colors>): DefaultTheme => {
  const colors = buildBaseTheme(input);

  return {
    ...colors,
    isDark: false,
    background: colors.white,
    backgroundSecondary: colors.warmGrey,
    backgroundTertiary: "#d7e0ea",
    backgroundQuaternary: darken(0.05, "#d7e0ea"),
    link: colors.accent,
    cursor: colors.almostBlack,
    text: colors.almostBlack,
    textSecondary: colors.slateDark,
    textTertiary: colors.slate,
    textDiffInserted: colors.almostBlack,
    textDiffInsertedBackground: "rgba(18, 138, 41, 0.16)",
    textDiffDeleted: colors.slateDark,
    textDiffDeletedBackground: "rgba(255, 180, 173, 0.25)",
    placeholder: "#a2b2c3",
    sidebarBackground: "hsl(212 31% 95% / 1)",
    sidebarHoverBackground: "hsl(212 31% 90% / 1)",
    sidebarActiveBackground: "hsl(212 31% 85% / 1)",
    sidebarControlHoverBackground: "rgb(138 164 193 / 20%)",
    sidebarDraftBorder: "hsl(212 31% 75% / 1)",
    sidebarText: "rgb(78, 92, 110)",
    backdrop: "rgba(0, 0, 0, 0.2)",
    shadow: "rgba(0, 0, 0, 0.08)",

    // Soft, layered shadows that mimic Apple/macOS elevation.
    // Each tier combines a tight close shadow (for crisp edge) with a wide
    // diffused ambient shadow (for the "floating in light" feel).
    shadow1:
      "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)",
    shadow2:
      "0 2px 4px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.06)",
    shadow3:
      "0 4px 8px rgba(15, 23, 42, 0.04), 0 12px 32px rgba(15, 23, 42, 0.08)",
    shadow4:
      "0 8px 16px rgba(15, 23, 42, 0.06), 0 24px 56px rgba(15, 23, 42, 0.12)",

    modalBackdrop: "rgba(15, 23, 42, 0.35)",
    modalBackground: colors.white,
    modalShadow:
      "0 24px 64px -12px rgba(15, 23, 42, 0.18), 0 8px 24px -8px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.04)",

    menuItemSelected: colors.warmGrey,
    menuBackground: colors.white,
    menuShadow:
      "0 0 0 1px rgba(15, 23, 42, 0.04), 0 8px 24px -8px rgba(15, 23, 42, 0.12), 0 24px 56px -16px rgba(15, 23, 42, 0.18)",
    divider: colors.slateLight,
    titleBarDivider: colors.slateLight,
    inputBorder: colors.slateLight,
    inputBorderFocused: colors.slate,
    inputBackground: colors.warmGrey,
    listItemHoverBackground: colors.warmGrey,
    mentionBackground: colors.warmGrey,
    mentionHoverBackground: "#d7e0ea",
    tableSelected: colors.accent,
    buttonNeutralBackground: colors.white,
    buttonNeutralHoverBackground: colors.warmGrey,
    buttonNeutralText: colors.almostBlack,
    buttonNeutralBorder: "hsl(212 31% 88% / 1)",
    tooltipBackground: colors.almostBlack,
    tooltipText: colors.white,
    toastBackground: colors.white,
    toastText: colors.almostBlack,
    quote: colors.slateLight,
    codeBackground: colors.smoke,
    codeBorder: colors.smokeDark,
    embedBorder: colors.slateLight,
    horizontalRule: colors.smokeDark,
    progressBarBackground: colors.slateLight,
    scrollbarBackground: colors.smoke,
    scrollbarThumb: darken(0.15, colors.smokeDark),
  };
};

export const buildDarkTheme = (input: Partial<Colors>): DefaultTheme => {
  const colors = buildBaseTheme(input);

  return {
    ...colors,
    isDark: true,
    background: colors.almostBlack,
    backgroundSecondary: "#1f232e",
    backgroundTertiary: "#2a2f3e",
    backgroundQuaternary: lighten(0.1, "#2a2f3e"),
    link: "#137FFB",
    text: colors.almostWhite,
    cursor: colors.almostWhite,
    textSecondary: lighten(0.1, colors.slate),
    textTertiary: colors.slate,
    textDiffInserted: colors.almostWhite,
    textDiffInsertedBackground: "rgba(63,185,80,0.25)",
    textDiffDeleted: darken(0.1, colors.almostWhite),
    textDiffDeletedBackground: "rgba(248,81,73,0.15)",
    placeholder: "hsl(215 17% 30% / 1)",
    sidebarBackground: colors.veryDarkBlue,
    sidebarHoverBackground: lighten(0.05, colors.veryDarkBlue),
    sidebarActiveBackground: lighten(0.09, colors.veryDarkBlue),
    sidebarControlHoverBackground: colors.white10,
    sidebarDraftBorder: lighten(0.2, colors.veryDarkBlue),
    sidebarText: colors.slate,
    backdrop: "rgba(0, 0, 0, 0.5)",
    shadow: "rgba(0, 0, 0, 0.6)",

    // Dark mode uses slightly stronger shadows since dark surfaces
    // need more separation from the background.
    shadow1: "0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.4)",
    shadow2: "0 2px 4px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.4)",
    shadow3: "0 4px 8px rgba(0, 0, 0, 0.4), 0 12px 32px rgba(0, 0, 0, 0.5)",
    shadow4: "0 8px 16px rgba(0, 0, 0, 0.4), 0 24px 56px rgba(0, 0, 0, 0.6)",

    modalBackdrop: colors.black50,
    modalBackground: "#181c25",
    modalShadow:
      "0 0 0 1px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.08)",

    menuItemSelected: lighten(0.09, "#181c25"),
    menuBackground: "#181c25",
    menuShadow:
      "0 0 0 1px rgb(34 40 52), 0 8px 16px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.08)",
    divider: lighten(0.1, colors.almostBlack),
    titleBarDivider: darken(0.4, colors.slate),
    inputBorder: colors.slateDark,
    inputBorderFocused: colors.slate,
    inputBackground: "#262d36",
    listItemHoverBackground: colors.white10,
    mentionBackground: lighten(0.09, colors.veryDarkBlue),
    mentionHoverBackground: lighten(0.15, colors.veryDarkBlue),
    tableSelected: colors.accent,
    buttonNeutralBackground: colors.almostBlack,
    buttonNeutralHoverBackground: lighten(0.09, colors.veryDarkBlue),
    buttonNeutralText: colors.white,
    buttonNeutralBorder: colors.slateDark,
    tooltipBackground: colors.white,
    tooltipText: colors.lightBlack,
    toastBackground: colors.veryDarkBlue,
    toastText: colors.almostWhite,
    quote: colors.almostWhite,
    code: colors.almostWhite,
    codeBackground: "#1d202a",
    codeBorder: colors.white10,
    codeComment: "#6a9955",
    codePunctuation: "#b3b3b3",
    codeProperty: "#b5cea8",
    codeNumber: "#b5cea8",
    codeTag: "#b5cea8",
    codeOperator: "#d4d4d4",
    codeConstant: "#9cdcfe",
    codeParameter: "#9cdcfe",
    codeSelector: "#ce9178",
    codeEntity: "#d4d4d4",
    codeStatement: "#d16969",
    codeInserted: "#b5cea8",
    codeString: "#ce9178",
    codeKeyword: "#569Cd6",
    codeFunction: "#dcdcaa",
    codeClassName: "#4ec9b0",
    codeImportant: "#569Cd6",
    codeAttrName: "#9cdcfe",
    codeAttrValue: "#ce9178",
    embedBorder: colors.black50,
    horizontalRule: lighten(0.1, colors.almostBlack),
    noticeInfoText: colors.white,
    noticeTipText: colors.white,
    noticeWarningText: colors.white,
    noticeSuccessText: colors.white,
    progressBarBackground: colors.slate,
    scrollbarBackground: colors.black,
    scrollbarThumb: colors.lightBlack,
  };
};

export const buildPitchBlackTheme = (input: Partial<Colors>) => {
  const colors = buildDarkTheme(input);

  return {
    ...colors,
    background: colors.black,
    codeBackground: colors.almostBlack,
  };
};

export const light = buildLightTheme(defaultColors);

export default light as DefaultTheme;
