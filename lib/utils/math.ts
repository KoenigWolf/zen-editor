/**
 * 値を指定された範囲内に制限する
 * @param value 制限する値
 * @param min 最小値
 * @param max 最大値
 * @returns min以上max以下に制限された値
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));
