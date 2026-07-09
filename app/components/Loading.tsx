import * as React from "react";
import styled, { keyframes } from "styled-components";
import { s } from "@shared/styles";

/**
 * Loading — inline indicator for async content.
 *
 * Three-dot Apple-style pulse: dots fade in/out sequentially with the spring
 * easing, never blocking the layout. Use as a quiet placeholder while data
 * resolves, or as a fallback when a heavier skeleton isn't appropriate.
 */
type Props = {
  /** Optional accessible label for the indicator. */
  label?: string;
  /** Size in px for each dot (default 6). */
  size?: number;
  /** Color override; defaults to textTertiary. */
  color?: string;
};

const Loading: React.FC<Props> = ({ label = "Loading", size = 6, color }) => (
  <Dots role="status" aria-label={label}>
    <Dot $size={size} $delay={0} $color={color} />
    <Dot $size={size} $delay={150} $color={color} />
    <Dot $size={size} $delay={300} $color={color} />
  </Dots>
);

// Apple rule: spring ease for delight, never linear / ease-in-out defaults.
const pulse = keyframes`
  0%, 80%, 100% {
    opacity: 0.35;
    transform: scale(0.85);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
`;

const Dots = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const Dot = styled.span<{
  $size: number;
  $delay: number;
  $color?: string;
}>`
  display: inline-block;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 50%;
  background: ${(p) => p.$color ?? p.theme.textTertiary};
  /* Spring overshoot gives each dot a tiny "breath" rather than a blink. */
  animation: ${pulse} 1200ms var(--ease-spring) infinite;
  animation-delay: ${(p) => p.$delay}ms;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export default Loading;