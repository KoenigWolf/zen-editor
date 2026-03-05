/**
 * SSR/CSR環境判定ユーティリティ
 */

/** ブラウザ環境かどうか */
export const isBrowser = typeof window !== 'undefined';

/** SSR安全なdocumentオブジェクト（SSR時はundefined） */
export const browserDocument = typeof document === 'undefined' ? undefined : document;

/** SSR安全なwindowオブジェクト（SSR時はundefined） */
export const browserWindow = typeof window === 'undefined' ? undefined : window;
