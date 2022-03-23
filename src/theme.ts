export type Scale = "sm" | "md" | "lg";

export type ScaleNumeric = { [K in Scale]: number };

export interface Theme {
  block: ScaleNumeric;
  color: {
    accent: string;
    background: string;
    text: string;
  };
  spacing: ScaleNumeric;
  text: ScaleNumeric;
}

export const theme: Theme = {
  block: {
    sm: 20,
    md: 36,
    lg: 64,
  },
  color: {
    accent: "#FFF",
    background: "#FF0",
    text: "#000",
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 32,
  },
  text: {
    sm: 12,
    md: 20,
    lg: 32,
  },
};
