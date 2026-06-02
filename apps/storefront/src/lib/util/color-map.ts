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
}

export const COLOR_OPTION_TITLES = ["Цвет", "Color", "Colour"]

export function isColorOption(title: string): boolean {
  return COLOR_OPTION_TITLES.includes(title)
}
