/**
 * 2つのオブジェクトの浅い比較を行う
 * @param a 比較対象1
 * @param b 比較対象2
 * @returns すべてのキーの値が等しければtrue
 */
export const shallowEqual = <T extends object>(a: T, b: T): boolean => {
  const keysA = Object.keys(a) as (keyof T)[];
  const keysB = Object.keys(b) as (keyof T)[];

  if (keysA.length !== keysB.length) {
    return false;
  }

  return keysA.every((key) => a[key] === b[key]);
};
