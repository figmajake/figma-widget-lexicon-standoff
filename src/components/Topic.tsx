import { theme } from "../theme";

const { widget } = figma;

const { Text } = widget;

interface Props {
  emphasize?: boolean;
  topic: string | null;
}

export const Topic = ({ emphasize = false, topic }: Props) => (
  <Text
    fill={theme.color.text}
    fontSize={theme.text.lg}
    fontWeight={emphasize ? "normal" : "extra-bold"}
    italic={emphasize}
  >
    “{topic}”
  </Text>
);
