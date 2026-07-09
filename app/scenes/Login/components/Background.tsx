import styled from "styled-components";
import { s } from "@shared/styles";
import Fade from "~/components/Fade";
import { draggableOnDesktop } from "~/styles";

/**
 * Login background — solid base + two soft radial "light orbs" that
 * subtly drift behind the form. The orbs use accent-tinted translucent
 * stops so the page feels alive without competing with the CTA.
 */
export const Background = styled(Fade)`
  width: 100vw;
  height: 100vh;
  min-height: 100dvh;
  background: ${s("background")};
  display: flex;
  position: relative;
  overflow: hidden;
  ${draggableOnDesktop()}

  /* Soft warm orb in the top-right — adds depth without noise */
  &::before {
    content: "";
    position: absolute;
    top: -200px;
    right: -200px;
    width: 700px;
    height: 700px;
    background: radial-gradient(
      circle at center,
      ${(props) =>
          props.theme.isDark
            ? "rgba(10, 132, 255, 0.18)"
            : "rgba(10, 132, 255, 0.08)"}
        0%,
      transparent 65%
    );
    pointer-events: none;
    z-index: 0;
  }

  /* Cool accent orb in the bottom-left — balances composition */
  &::after {
    content: "";
    position: absolute;
    bottom: -260px;
    left: -160px;
    width: 640px;
    height: 640px;
    background: radial-gradient(
      circle at center,
      ${(props) =>
          props.theme.isDark
            ? "rgba(175, 82, 222, 0.16)"
            : "rgba(175, 82, 222, 0.07)"}
        0%,
      transparent 60%
    );
    pointer-events: none;
    z-index: 0;
  }

  /* Make sure the form content sits above the orbs */
  & > * {
    position: relative;
    z-index: 1;
  }
`;
