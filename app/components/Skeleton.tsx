import * as React from "react";
import styled, { keyframes } from "styled-components";
import { s } from "@shared/styles";

/**
 * Skeleton — Apple-style shimmering placeholder.
 *
 * The shimmer sweeps a linear gradient across the surface at a constant rate
 * so the eye can read it as a moving highlight rather than a blink. Base is
 * `backgroundSecondary`, highlight `backgroundTertiary`; the rounded
 * `--radius-sm` keeps the placeholder soft and consistent with surrounding
 * controls.
 */
type Props = React.HTMLAttributes<HTMLDivElement> & {
  /** Width of the skeleton (any CSS length). Defaults to 100%. */
  width?: string | number;
  /** Height of the skeleton (any CSS length). Defaults to 14px. */
  height?: string | number;
  /** Use a fully circular skeleton (icons / avatars). */
  rounded?: boolean;
  /** Override the corner radius. Defaults to --radius-sm. */
  radius?: string;
};

const Skeleton: React.FC<Props> = ({
  width = "100%",
  height = 14,
  rounded,
  radius,
  style,
  ...rest
}) => (
  <Bar
    {...rest}
    $width={typeof width === "number" ? `${width}px` : width}
    $height={typeof height === "number" ? `${height}px` : height}
    $radius={radius}
    $rounded={rounded}
    style={style}
    aria-hidden
  />
);

// Apple rule: linear timing for shimmer — even sweep, no jarring curve.
const shimmer = keyframes`
  from { background-position: -200% 0; }
  to   { background-position:  200% 0; }
`;

const Bar = styled.div<{
  $width: string;
  $height: string;
  $rounded?: boolean;
  $radius?: string;
}>`
  display: block;
  width: ${(p) => p.$width};
  height: ${(p) => p.$height};
  border-radius: ${(p) =>
    p.$rounded ? "50%" : (p.$radius ?? "var(--radius-sm)")};
  background-color: ${s("backgroundSecondary")};
  background-image: linear-gradient(
    90deg,
    ${s("backgroundSecondary")} 0%,
    ${s("backgroundTertiary")} 50%,
    ${s("backgroundSecondary")} 100%
  );
  background-size: 200% 100%;
  /* Constant sweep — Apple rule bans ease-in-out defaults. */
  animation: ${shimmer} 1500ms linear infinite;
  /* Respect users who prefer reduced motion. */
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export default Skeleton;
