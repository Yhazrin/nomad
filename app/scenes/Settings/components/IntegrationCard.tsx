import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { s, ellipsis, hover } from "@shared/styles";
import type { ConfigItem } from "~/hooks/useSettingsConfig";
import Button from "../../../components/Button";
import Text from "../../../components/Text";
import { VStack } from "~/components/primitives/VStack";
import { Status } from "./Status";
import Flex from "@shared/components/Flex";

type Props = {
  integration: ConfigItem;
  isConnected?: boolean;
};

function IntegrationCard({ integration, isConnected }: Props) {
  const { t } = useTranslation();

  return (
    <Card as={Link} to={integration.path}>
      <CardInner>
        <Flex justify="space-between" align="flex-start">
          <VStack align="flex-start">
            <integration.icon size={32} monochrome={false} />
            <VStack spacing={2} align="flex-start">
              <Name>{integration.name}</Name>
              {isConnected && <Status>{t("Connected")}</Status>}
            </VStack>
          </VStack>
          <Button as="span" neutral>
            {t("Configure")}
          </Button>
        </Flex>

        <Description>{integration.description}</Description>
      </CardInner>
    </Card>
  );
}

export default IntegrationCard;

/**
 * Apple-style "Double-Bezel" card shell.
 * The outer wrapper has a faint offset background (the bezel) that the inner
 * core sits on. Together they create the layered "two materials" look.
 */
export const Card = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 300px;
  background: ${(props) =>
    props.theme.isDark
      ? "rgba(255, 255, 255, 0.04)"
      : "rgba(15, 23, 42, 0.04)"};
  border-radius: var(--radius-lg);
  transition:
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
  cursor: var(--pointer);

  &: ${hover} {
    transform: translateY(-2px);
    box-shadow: var(--shadow-3);
  }
`;

const CardInner = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 20px;
  background: ${s("background")};
  color: ${s("text")};
  border-radius: calc(var(--radius-lg) - 1.5px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
`;

const Name = styled(Text)`
  margin: 0 0 -4px;
  font-size: 16px;
  font-weight: 600;
  color: ${s("text")};
  ${ellipsis()}
`;

const Description = styled(Text)`
  margin: 12px 0 0;
  font-size: 15px;
  max-width: 100%;
  color: ${s("textTertiary")};
`;
