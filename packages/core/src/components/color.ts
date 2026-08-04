/**
 * Resolve a Discord embed/container accent color to an RGB integer.
 * Stambha accepts number, `#RRGGBB` / `RRGGBB`, or `[r, g, b]` (0–255).
 */
export type ColorInput = number | string | readonly [number, number, number];

export function resolveColor(color: ColorInput): number {
  if (typeof color === "number") {
    if (!Number.isInteger(color) || color < 0 || color > 0xffffff) {
      throw new RangeError(`Color must be an integer 0–0xFFFFFF, got ${color}`);
    }
    return color;
  }
  if (typeof color === "string") {
    const hex = color.trim().replace(/^#/, "");
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
      throw new TypeError(`Expected #RRGGBB color string, got "${color}"`);
    }
    return Number.parseInt(hex, 16);
  }
  const [r, g, b] = color;
  for (const c of [r, g, b]) {
    if (!Number.isInteger(c) || c < 0 || c > 255) {
      throw new RangeError(`RGB components must be integers 0–255, got [${r}, ${g}, ${b}]`);
    }
  }
  return (r << 16) + (g << 8) + b;
}

/** Format an RGB integer as `#rrggbb` (lowercase). */
export function hexColor(color: number | null | undefined): string | null {
  if (color === null || color === undefined) return null;
  return `#${color.toString(16).padStart(6, "0")}`;
}
