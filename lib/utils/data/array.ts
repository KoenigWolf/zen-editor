/**
 * 配列操作ユーティリティ
 */

/**
 * 循環インデックスを計算（負の値も正しく処理）
 * @param index 現在のインデックス
 * @param length 配列の長さ
 * @returns 0 から length-1 の範囲のインデックス
 */
export const wrapIndex = (index: number, length: number): number => {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
};

/**
 * 次のインデックスを取得（循環）
 */
export const getNextIndex = (currentIndex: number, length: number): number =>
  wrapIndex(currentIndex + 1, length);

/**
 * 前のインデックスを取得（循環）
 */
export const getPrevIndex = (currentIndex: number, length: number): number =>
  wrapIndex(currentIndex - 1, length);

/**
 * 配列内の要素を移動（ドラッグ＆ドロップ用）
 * @param array 元の配列
 * @param fromIndex 移動元インデックス
 * @param toIndex 移動先インデックス
 * @returns 新しい配列
 */
export const reorderArray = <T>(array: T[], fromIndex: number, toIndex: number): T[] => {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
};
