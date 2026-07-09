import type { LocationDescriptor } from "history";
import { DisclosureIcon } from "outline-icons";
import { darken, lighten, transparentize } from "polished";
import * as React from "react";
import styled from "styled-components";
import type { HapticInput } from "web-haptics";
import { useWebHaptics } from "web-haptics/react";
import { s } from "@shared/styles";
import type { Props as ActionButtonProps } from "~/components/ActionButton";
import ActionButton from "~/components/ActionButton";
import { undraggableOnDesktop } from "~/styles";

type RealProps = {
  $fullwidth?: boolean;
  $borderOnHover?: boolean;
  $neutral?: boolean;
  $danger?: boolean;
};

const RealButton = styled(ActionButton)<RealProps>`
  display: ${(props) => (props.$fullwidth ? "block" : "inline-block")};
  width: ${(props) => (props.$fullwidth ? "100%" : "auto")};
  margin: 0;
  padding: 0;
  border: 0;
  background: ${s("accent")};
  color: ${s("accentText")};
  /* Soft, multi-layer ambient shadow — Apple-style elevation */
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06),
    0 2px 6px rgba(10, 132, 255, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  /* Squircle proportions — radius follows height ~ 22% like iOS */
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.005em;
  height: 34px;
  text-decoration: none;
  flex-shrink: 0;
  cursor: var(--pointer);
  user-select: none;
  appearance: none !important;
  /* Apple cubic-bezier + gentle duration */
  transition: background var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
  ${undraggableOnDesktop()}

  &::-moz-focus-inner {
    padding: 0;
    border: 0;
  }

  &:hover:not(:disabled),
  &[aria-expanded="true"] {
    background: ${(props) => darken(0.04, props.theme.accent)};
    /* Lift slightly on hover for kinetic feedback */
    transform: translateY(-0.5px);
    box-shadow: 0 2px 4px rgba(15, 23, 42, 0.08),
      0 6px 14px rgba(10, 132, 255, 0.24),
      inset 0 1px 0 rgba(255, 255, 255, 0.18);
  }

  /* Micro-press: Apple-like tactile feedback on click */
  &:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transition-duration: 80ms;
  }

  &:disabled {
    cursor: default;
    pointer-events: none;
    color: ${(props) => transparentize(0.3, props.theme.accentText)};
    background: ${(props) => transparentize(0.1, props.theme.accent)};
    box-shadow: none;
    transform: none;

    svg {
      fill: ${(props) => props.theme.white50};
    }
  }

  ${(props) =>
    props.$neutral &&
    `
    background: ${props.theme.buttonNeutralBackground};
    color: ${props.theme.buttonNeutralText};
    box-shadow: ${
      props.$borderOnHover
        ? "none"
        : `0 1px 2px rgba(15, 23, 42, 0.04), ${props.theme.buttonNeutralBorder} 0 0 0 1px inset`
    };

    &:hover:not(:disabled),
    &[aria-expanded="true"] {
      background: ${
        props.$borderOnHover
          ? props.theme.buttonNeutralBackground
          : props.theme.buttonNeutralHoverBackground
      };
      box-shadow: 0 2px 4px rgba(15, 23, 42, 0.06), ${
      props.theme.buttonNeutralBorder
    } 0 0 0 1px inset;
      transform: translateY(-0.5px);
    }

    &:active:not(:disabled) {
      transform: translateY(0) scale(0.98);
      transition-duration: 80ms;
    }

    &:focus-visible {
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), ${props.theme.inputBorderFocused} 0 0 0 1px inset;
    }

    &:disabled {
      color: ${props.theme.textTertiary};
      background: none;
      transform: none;

      svg {
        fill: currentColor;
      }
    }
  `}

  ${(props) =>
    props.$danger &&
    `
      background: ${props.theme.danger};
      color: ${props.theme.white};

      &:hover:not(:disabled),
      &[aria-expanded="true"] {
        background: ${darken(0.04, props.theme.danger)};
      }

      &:active:not(:disabled) {
        transform: scale(0.98);
        transition-duration: 80ms;
      }

      &:disabled {
        background: ${lighten(0.05, props.theme.danger)};
      }

      &:focus-visible {
        outline-color: ${darken(0.2, props.theme.danger)} !important;
      }
  `};
`;

const Label = styled.span<{ hasIcon?: boolean }>`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  ${(props) => props.hasIcon && "padding-inline-start: 4px;"};
`;

export const Inner = styled.span<{
  disclosure?: boolean;
  hasIcon?: boolean;
  hasText?: boolean;
}>`
  display: flex;
  padding: 0 12px;
  padding-inline-end: ${(props) => (props.disclosure ? 4 : 12)}px;
  line-height: ${(props) => (props.hasIcon ? 24 : 34)}px;
  justify-content: center;
  align-items: center;
  min-height: 34px;
  gap: 6px;

  ${(props) => props.hasIcon && props.hasText && "padding-inline-start: 6px;"};
  ${(props) => props.hasIcon && !props.hasText && "padding: 0 6px;"};
`;

export type Props<T> = ActionButtonProps & {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  disclosure?: boolean;
  neutral?: boolean;
  danger?: boolean;
  fullwidth?: boolean;
  as?: T;
  to?: LocationDescriptor;
  /** Haptic feedback to trigger on click. Pass a preset name or custom pattern. */
  haptic?: HapticInput;
  borderOnHover?: boolean;
  hideIcon?: boolean;
  href?: string;
  "data-on"?: string;
  "data-event-category"?: string;
  "data-event-action"?: string;
};

const Button = <T extends React.ElementType = "button">(
  props: Props<T> & React.ComponentPropsWithoutRef<T>,
  ref: React.Ref<HTMLButtonElement>
) => {
  const {
    type,
    children,
    value,
    disclosure,
    neutral,
    action,
    icon,
    borderOnHover,
    hideIcon,
    fullwidth,
    danger,
    haptic,
    ...rest
  } = props;
  const hasText = !!children || value !== undefined;
  const ic = hideIcon ? undefined : (action?.icon ?? icon);
  const hasIcon = ic !== undefined;
  const { trigger } = useWebHaptics();

  return (
    <RealButton
      type={type || "button"}
      ref={ref}
      $neutral={neutral}
      action={action}
      $danger={danger}
      $fullwidth={fullwidth}
      $borderOnHover={borderOnHover}
      onClickCapture={haptic ? () => void trigger(haptic) : undefined}
      {...rest}
    >
      <Inner hasIcon={hasIcon} hasText={hasText} disclosure={disclosure}>
        {hasIcon && ic}
        {hasText && <Label hasIcon={hasIcon}>{children || value}</Label>}
        {disclosure && <StyledDisclosureIcon />}
      </Inner>
    </RealButton>
  );
};

const StyledDisclosureIcon = styled(DisclosureIcon)`
  opacity: 0.8;
`;

export default React.forwardRef(Button);
