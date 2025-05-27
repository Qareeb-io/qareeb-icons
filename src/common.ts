export type Size =
  | "xs"
  | "sm"
  | "base"
  | "md"
  | "lg"
  | "xl"
  | "xxl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "8xl"
  | "9xl"
  | "10xl"
  | "11xl"
  | "12xl"
  | "13xl";

export const SizeMap: Record<Size, number> = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 32,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 64,
  "6xl": 72,
  "7xl": 80,
  "8xl": 96,
  "9xl": 128,
  "10xl": 144,
  "11xl": 160,
  "12xl": 192,
  "13xl": 256,
};
