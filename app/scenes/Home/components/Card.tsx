import * as React from "react";
import styled from "styled-components";

type Props = {
  /** Section title shown at the top of the card. */
  title: React.ReactNode;
  /** Optional element rendered to the right of the title (e.g. "View all"). */
  action?: React.ReactNode;
  /** The card body. */
  children?: React.ReactNode;
  /** Optional aria-label override. */
  "aria-label"?: string;
};

/**
 * Card is the simple, neutral surface used by every Focus section. It uses a
 * 1px border + soft background — no decorative gradient/glass/animated
 * borders. Animations are limited to opacity + transform per project rules.
 */
const Card = React.forwardRef<HTMLDivElement, Props>(function Card(
  { title, action, children, ...rest },
  ref
) {
  return (
    <Frame ref={ref} {...rest}>
      <Header>
        <Title>{title}</Title>
        {action ? <ActionSlot>{action}</ActionSlot> : null}
      </Header>
      <Body>{children}</Body>
    </Frame>
  );
});

const Frame = styled.section`
  background: ${(props) => props.theme.background};
  border: 1px solid ${(props) => props.theme.divider};
  border-radius: var(--radius-lg);
  padding: 18px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* Static shadow tier 1 — no hover animation. */
  box-shadow: ${(props) => props.theme.shadow1};
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${(props) => props.theme.textTertiary};
`;

const ActionSlot = styled.div`
  display: flex;
  align-items: center;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export default Card;
