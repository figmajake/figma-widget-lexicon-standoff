import { Scale, theme } from "../theme";

const { widget } = figma;
const { Image } = widget;

interface Props {
  size?: Scale;
  key?: number | string | null;
  onClick?(): void;
  round?: boolean;
  src: string | null;
}

export const Avatar = ({ size = "md", key, onClick, round, src }: Props) => (
  <Image
    cornerRadius={round ? theme.block[size] : 0}
    height={theme.block[size]}
    key={key || undefined}
    onClick={onClick}
    src={src || ""}
    width={theme.block[size]}
  />
);
