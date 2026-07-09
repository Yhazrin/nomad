import styled from "styled-components";
import type Document from "~/models/Document";
import KeyboardShortcutsButton from "./KeyboardShortcutsButton";
import ConnectionStatus from "./ConnectionStatus";
import { SizeWarning } from "./SizeWarning";

type Props = {
  document: Document;
};

export const Footer = ({ document }: Props) => (
  <FooterWrapper>
    <Pill>
      <ConnectionStatus />
    </Pill>
    <Pill>
      <SizeWarning document={document} />
    </Pill>
    <Pill>
      <KeyboardShortcutsButton />
    </Pill>
  </FooterWrapper>
);

const FooterWrapper = styled.div`
  position: fixed;
  bottom: 12px;
  right: 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  z-index: 10;
`;

const Pill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: ${(props) => props.theme.backgroundSecondary};
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-1);
  font-size: 12px;
  line-height: 1;
  color: ${(props) => props.theme.textSecondary};
  transition:
    box-shadow var(--duration) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);

  svg {
    width: 14px;
    height: 14px;
  }

  button {
    font-size: 12px;
    line-height: 1;
  }

  &:hover {
    box-shadow: var(--shadow-2);
  }

  @media print {
    display: none;
  }
`;
