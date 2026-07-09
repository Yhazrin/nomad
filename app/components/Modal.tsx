import * as Dialog from "@radix-ui/react-dialog";
import { observer } from "mobx-react";
import { CloseIcon, BackIcon } from "outline-icons";
import * as React from "react";
import { useTranslation } from "react-i18next";
import styled, { keyframes } from "styled-components";
import breakpoint from "styled-components-breakpoint";
import { depths, s } from "@shared/styles";
import Flex from "~/components/Flex";
import NudeButton from "~/components/NudeButton";
import Scrollable from "~/components/Scrollable";
import Text from "~/components/Text";
import useMobile from "~/hooks/useMobile";
import usePrevious from "~/hooks/usePrevious";
import { fadeIn } from "~/styles/animations";
import Desktop from "~/utils/Desktop";
import ErrorBoundary from "./ErrorBoundary";
import Tooltip from "./Tooltip";
import { useDialogContext } from "~/components/DialogContext";

type Props = {
  children?: React.ReactNode;
  isOpen: boolean;
  title?: React.ReactNode;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  onRequestClose: () => void;
};

const Modal: React.FC<Props> = ({
  children,
  isOpen,
  title,
  style,
  width,
  height,
  onRequestClose,
}: Props) => {
  const wasOpen = usePrevious(isOpen);
  const isMobile = useMobile();
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("Untitled");
  const dialog = useDialogContext();

  const onClose = React.useCallback(() => {
    dialog.setAnimating(false); // Reset
    onRequestClose();
  }, [dialog, onRequestClose]);

  if (!isOpen && !wasOpen) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledContent
          onEscapeKeyDown={onClose}
          onPointerDownOutside={onClose}
          aria-describedby={undefined}
        >
          {isMobile ? (
            <Mobile>
              <MobileContent>
                <Centered onClick={(ev) => ev.stopPropagation()} column>
                  <Dialog.Title asChild>
                    <Text size="xlarge" weight="bold">
                      {resolvedTitle}
                    </Text>
                  </Dialog.Title>
                  <ErrorBoundary>{children}</ErrorBoundary>
                </Centered>
              </MobileContent>
              <Close onClick={onClose}>
                <CloseIcon size={32} />
              </Close>
              <Back onClick={onClose}>
                <BackIcon size={32} />
                <Text>{t("Back")} </Text>
              </Back>
            </Mobile>
          ) : (
            <Wrapper $width={width} $height={height}>
              <CardInner>
                <Centered
                  onClick={(ev) => ev.stopPropagation()}
                  // maxHeight needed for proper overflow behavior in Safari
                  style={{ maxHeight: "65vh" }}
                  column
                  reverse
                >
                  <DesktopContent
                    style={style}
                    topShadow
                    overflow={dialog.animating ? "hidden" : undefined}
                    onAnimationEnd={() => dialog.setAnimating(false)}
                  >
                    <ErrorBoundary component="div">{children}</ErrorBoundary>
                  </DesktopContent>
                  <Header>
                    <Dialog.Title asChild>
                      <Text size="large">{resolvedTitle}</Text>
                    </Dialog.Title>
                    <Tooltip content={t("Close")} shortcut="Esc">
                      <NudeButton onClick={onClose} aria-label={t("Close")}>
                        <CloseIcon />
                      </NudeButton>
                    </Tooltip>
                  </Header>
                </Centered>
              </CardInner>
            </Wrapper>
          )}
        </StyledContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const StyledOverlay = styled(Dialog.Overlay)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${(props) => props.theme.modalBackdrop} !important;
  z-index: ${depths.overlay};
  animation: ${fadeIn} 200ms ease;
`;

const StyledContent = styled(Dialog.Content)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${depths.modal};
  display: flex;
  justify-content: center;
  align-items: flex-start;
  outline: none;
`;

/**
 * Apple-style modal entrance: subtle scale-in from 0.96 to 1.0, paired
 * with a gentle opacity rise. Easing matches the Apple sheet curve.
 */
const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const Mobile = styled.div`
  animation: ${scaleIn} var(--duration) var(--ease-out);

  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${depths.modal};
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: ${s("background")};
  outline: none;
`;

const MobileContent = styled(Scrollable)`
  width: 100%;
  padding: 8vh 12px;

  ${breakpoint("tablet")`
    padding: 13vh 2rem 2rem;
  `};
`;

const DesktopContent = styled(Scrollable)`
  padding: 8px 24px 24px;
`;

const Centered = styled(Flex)`
  width: 640px;
  max-width: 100%;
  position: relative;
  margin: 0 auto;
`;

const Close = styled(NudeButton)`
  position: absolute;
  display: block;
  top: 0;
  right: 0;
  margin: 12px;
  opacity: 0.75;
  color: ${s("text")};
  width: auto;
  height: auto;

  &:hover {
    opacity: 1;
  }

  ${breakpoint("tablet")`
    display: none;
  `};
`;

const Back = styled(NudeButton)`
  position: absolute;
  display: none;
  align-items: center;
  top: ${Desktop.hasInsetTitlebar() ? "3rem" : "2rem"};
  left: 2rem;
  opacity: 0.75;
  color: ${s("text")};
  font-weight: 500;
  width: auto;
  height: auto;

  &:hover {
    opacity: 1;
  }

  ${breakpoint("tablet")`
    display: flex;
  `};
`;

const Header = styled(Flex)`
  color: ${s("textSecondary")};
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  padding: 24px 24px 12px;
  flex-shrink: 0;
`;

/**
 * Outer bezel shell of the modal — a thin "lip" of slightly darker color
 * visible all the way around the inner core.
 */
const Wrapper = styled.div<{
  $width?: number | string;
  $height?: number | string;
}>`
  animation: ${scaleIn} var(--duration) var(--ease-out);

  margin: 25vh auto auto auto;
  width: 75vw;
  min-width: 350px;
  max-width: ${(props) => props.$width || "450px"};
  max-height: ${(props) => props.$height || "70vh"};
  z-index: ${depths.modal};
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: ${(props) =>
    props.theme.isDark
      ? "rgba(255, 255, 255, 0.04)"
      : "rgba(15, 23, 42, 0.04)"};
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-4);
  outline: none;

  ${NudeButton} {
    &:hover,
    &[aria-expanded="true"] {
      background: ${s("sidebarControlHoverBackground")};
    }
    vertical-align: middle;
  }

  ${Header} {
    align-items: start;
  }
`;

/**
 * Inner core of the modal — the actual interactive surface where content
 * lives. The inset highlight at the top fakes a thin light catching the
 * upper edge, an Apple-style depth cue.
 */
const CardInner = styled.div`
  width: 100%;
  background: ${s("modalBackground")};
  border-radius: calc(var(--radius-xl) - 1.5px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
  overflow: hidden;
`;

export default observer(Modal);
