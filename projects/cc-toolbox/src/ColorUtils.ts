/**
 * Minimal color helper to replace canvas-sketch-util/color.
 * Supports hex (#RRGGBB or #RRGGBBAA) and rgba()/rgb().
 */
export interface ParsedColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export class ColorUtils {
  public static parse(color: string): { value: ParsedColor; alpha: number } {
    const value = ColorUtils.toRgba(color);
    return { value, alpha: value.a };
  }

  public static toRgba(color: string): ParsedColor {
    if (!color || typeof color !== "string") {
      return { r: 0, g: 0, b: 0, a: 1 };
    }

    const trimmed = color.trim();

    if (trimmed.startsWith("#")) {
      return ColorUtils.fromHex(trimmed);
    }

    if (trimmed.startsWith("rgba")) {
      const match = trimmed
        .replace(/rgba?\(/, "")
        .replace(")", "")
        .split(",")
        .map((v) => parseFloat(v.trim()));
      if (match.length >= 4) {
        return { r: match[0], g: match[1], b: match[2], a: match[3] };
      }
    }

    if (trimmed.startsWith("rgb")) {
      const match = trimmed
        .replace(/rgb\(/, "")
        .replace(")", "")
        .split(",")
        .map((v) => parseFloat(v.trim()));
      if (match.length >= 3) {
        return { r: match[0], g: match[1], b: match[2], a: 1 };
      }
    }

    // fallback: return opaque black
    return { r: 0, g: 0, b: 0, a: 1 };
  }

  private static fromHex(hex: string): ParsedColor {
    const clean = hex.replace("#", "");
    if (clean.length === 3) {
      const [r, g, b] = clean.split("").map((c) => parseInt(c + c, 16));
      return { r, g, b, a: 1 };
    }
    if (clean.length === 6 || clean.length === 8) {
      const r = parseInt(clean.substring(0, 2), 16);
      const g = parseInt(clean.substring(2, 4), 16);
      const b = parseInt(clean.substring(4, 6), 16);
      const a =
        clean.length === 8
          ? parseInt(clean.substring(6, 8), 16) / 255
          : 1;
      return { r, g, b, a };
    }
    return { r: 0, g: 0, b: 0, a: 1 };
  }
}
