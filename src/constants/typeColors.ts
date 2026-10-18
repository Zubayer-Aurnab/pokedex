import type { PokemonType } from "@/types/pokemon";

export interface TypeColor {
  /** Main fill color for cards, chips and hero gradients. */
  background: string;
  /** Lighter tone that stays readable on the dark glass UI (borders, highlights). */
  accent: string;
}

export const TYPE_COLORS: Record<PokemonType, TypeColor> = {
  normal: { background: "#A8A878", accent: "#D8D8B4" },
  fire: { background: "#FF421C", accent: "#FF9A6B" },
  water: { background: "#2992FF", accent: "#8CC4FF" },
  electric: { background: "#FFD700", accent: "#FFE97A" },
  grass: { background: "#78C850", accent: "#B4E89A" },
  ice: { background: "#66D1E5", accent: "#B5F0FA" },
  fighting: { background: "#D3425F", accent: "#F08CA0" },
  poison: { background: "#B567CE", accent: "#DDA8EE" },
  ground: { background: "#D97746", accent: "#F2B48F" },
  flying: { background: "#89AAE3", accent: "#C3D4F5" },
  psychic: { background: "#FA5C8B", accent: "#FFA3C0" },
  bug: { background: "#9DC130", accent: "#CDE57A" },
  rock: { background: "#C5B78C", accent: "#E6DCBC" },
  ghost: { background: "#5F6DBC", accent: "#A3AEE8" },
  dragon: { background: "#0B6DC3", accent: "#6FB2F0" },
  dark: { background: "#595761", accent: "#A19FA8" },
  steel: { background: "#5695A3", accent: "#9FCAD3" },
  fairy: { background: "#EE90E6", accent: "#F8C6F3" },
};

export const FALLBACK_TYPE_COLOR: TypeColor = { background: "#64748B", accent: "#CBD5E1" };

export function getTypeColor(type: PokemonType | undefined): TypeColor {
  return type ? TYPE_COLORS[type] : FALLBACK_TYPE_COLOR;
}

/** `#RRGGBB` + alpha (0–1) → `rgba(...)`. */
export function withAlpha(hex: string, alpha: number) {
  const value = parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}

/** Dark text on light fills (Electric, Ice, …), white text otherwise. */
export function readableTextColor(hex: string) {
  const value = parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 170 ? "#111827" : "#FFFFFF";
}
