import { MoreIcon } from "outline-icons";
import { observer } from "mobx-react";
import * as React from "react";
import styled from "styled-components";
import breakpoint from "styled-components-breakpoint";
import { extraArea, hover, s } from "@shared/styles";
import Flex from "~/components/Flex";
import Text from "~/components/Text";
import { draggableOnDesktop, undraggableOnDesktop } from "~/styles";
import Desktop from "~/utils/Desktop";
import { HStack } from "~/components/primitives/HStack";

export type SidebarButtonProps = React.ComponentProps<typeof Button> & {
  position?: "top" | "bottom";
  title: React.ReactNode;
  image: React.ReactNode;
  showMoreMenu?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
};

const SidebarButton = observer(
  React.forwardRef<HTMLButtonElement, SidebarButtonProps>(
    function SidebarButton_(
      {
        position = "top",
        showMoreMenu,
        image,
        title,
        children,
        onClick,
        ...rest
      }: SidebarButtonProps,
      ref
    ) {
      return (
        <Container
          justify="space-between"
          align="center"
          shrink={false}
          $position={position}
        >
          <Button
            {...rest}
            onClick={onClick}
            $position={position}
            as="button"
            ref={ref}
            role="button"
          >
            <Content>
              {image}
              {title && <Title>{title}</Title>}
            </Content>
            {showMoreMenu && <StyledMoreIcon />}
          </Button>
          {children}
        </Container>
      );
    }
  )
);

const StyledMoreIcon = styled(MoreIcon)`
  flex-shrink: 0;
`;

const Container = styled(Flex)<{ $position: "top" | "bottom" }>`
  overflow: hidden;
  padding-top: ${(props) =>
    props.$position === "top" && Desktop.hasInsetTitlebar() ? 40 : 0}px;
  padding-inline: 6px;
  ${draggableOnDesktop()}
`;

const Title = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  letter-spacing: -0.005em;
`;

const Content = styled(HStack)`
  flex-shrink: 1;
  flex-grow: 1;
  gap: 12px;
`;

const Button = styled(Flex)<{
  $position: "top" | "bottom";
}>`
  flex: 1;
  color: ${s("textTertiary")};
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  border-radius: var(--radius-pill);
  border: 0;
  margin: 4px 0;
  background: none;
  flex-shrink: 0;

  -webkit-appearance: none;
  text-decoration: none;
  text-align: start;
  user-select: none;
  position: relative;
  cursor: var(--pointer);
  transition:
    background var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);

  ${undraggableOnDesktop()}
  ${extraArea(4)}
  ${breakpoint("tablet")`
    padding: 8px 12px;
  `}

  &:not(:disabled) {
    &: ${hover} {
      background: rgba(0, 0, 0, 0.04);
      color: ${s("text")};
    }

    &:active,
    &[aria-expanded="true"] {
      color: ${s("text")};
      background: rgba(0, 0, 0, 0.06);
    }
  }
`;

export default SidebarButton;
