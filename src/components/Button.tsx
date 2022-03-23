import { Scale, theme } from "../theme";

const { widget } = figma;
const { AutoLayout, Text } = widget;

interface Props extends HasChildrenProps {
  onClick(): void;
  size?: Scale;
  square?: boolean;
  width?: WidgetJSX.AutolayoutSize;
}

export const Button = ({
  children,
  onClick,
  size = "md",
  square = false,
  width = "hug-contents",
}: Props) => {
  const height = theme.block[size];
  return (
    <AutoLayout
      cornerRadius={theme.block.lg}
      height={height}
      horizontalAlignItems="center"
      fill={theme.color.text}
      onClick={onClick}
      padding={theme.spacing[size]}
      verticalAlignItems="center"
      width={square ? height : width}
    >
      <Text
        fontSize={theme.text[size]}
        fill={theme.color.accent}
        fontWeight="extra-bold"
      >
        {children}
      </Text>
    </AutoLayout>
  );
};
