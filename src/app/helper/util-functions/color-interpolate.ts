export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export function getRgb(color: string): RgbColor {
  let [r, g, b] = color
    .replace('rgb(', '')
    .replace(')', '')
    .split(',')
    .map((str) => Number(str));
  return {
    r,
    g,
    b,
  };
}

export function colorInterpolate(
  colorA: string,
  colorB: string,
  intval: number
): string {
  const rgbA = getRgb(colorA),
    rgbB = getRgb(colorB);
  const interpolatedColor: RgbColor = {
    r: rgbA.r * (1 - intval) + rgbB.r * intval,
    g: rgbA.g * (1 - intval) + rgbB.g * intval,
    b: rgbA.b * (1 - intval) + rgbB.b * intval,
  };
  return `rgb( ${interpolatedColor.r}, ${interpolatedColor.g}, ${interpolatedColor.b})`;
}
