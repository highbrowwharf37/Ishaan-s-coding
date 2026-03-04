export function pct(val: number, min: number, max: number): number {
  return max > min ? Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100)) : 50;
}

export function fmtSign(val: number, decimals = 1): string {
  return `${val >= 0 ? '+' : ''}${val.toFixed(decimals)}`;
}
