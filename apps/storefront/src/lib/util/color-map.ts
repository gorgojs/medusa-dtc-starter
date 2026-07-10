export const COLOR_MAP: Record<string, string> = {
  Чёрный: "#111111",
  Белый: "#ffffff",
  Серый: "#9ca3af",
  Синий: "#3b82f6",
  Красный: "#ef4444",
  Зелёный: "#22c55e",
  Жёлтый: "#eab308",
  Розовый: "#ec4899",
  Black: "#111111",
  White: "#ffffff",
  Gray: "#9ca3af",
  Blue: "#3b82f6",
  Red: "#ef4444",
  Green: "#22c55e",
  Yellow: "#eab308",
  Pink: "#ec4899",
  Noir: "#111111",
  Blanc: "#ffffff",
  Gris: "#9ca3af",
  Bleu: "#3b82f6",
  Rouge: "#ef4444",
  Vert: "#22c55e",
  Jaune: "#eab308",
  Rose: "#ec4899",
  Negro: "#111111",
  Blanco: "#ffffff",
  Azul: "#3b82f6",
  Rojo: "#ef4444",
  Verde: "#22c55e",
  Amarillo: "#eab308",
  Rosa: "#ec4899",
}

export const WHITE_HEX = "#ffffff"
export const FALLBACK_COLOR = "#d1d5db"

export const COLOR_OPTION_TITLES = ["Цвет", "Color", "Colour", "Couleur"]

export const SIZE_OPTION_TITLES = ["Размер", "Size", "Taille", "Talla"]

export function isColorOption(title: string): boolean {
  return COLOR_OPTION_TITLES.includes(title)
}

export function isSizeOption(title: string): boolean {
  return SIZE_OPTION_TITLES.includes(title)
}

export function resolveColorHex(value: string): string {
  return COLOR_MAP[value] ?? FALLBACK_COLOR
}
