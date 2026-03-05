/**
 * ユーティリティモジュール
 */

// クラス名結合
export { cn, getDisplayFileName } from './cn';

// ストレージ
export { safeLocalStorageGet, safeLocalStorageSet } from './storage';

// セキュリティ
export {
  FILE_SECURITY,
  SEARCH_SECURITY,
  validateFile,
  validateSearchQuery,
  escapeRegExp,
  sanitizeText,
  isValidUrl,
} from './security';

// インデント
export { indentLines, outdentLines } from './indent';

// ファイルタイプ
export {
  FILE_ICON_MAP,
  FILE_COLOR_MAP,
  DEFAULT_FILE_ICON,
  DEFAULT_FILE_COLOR,
  getFileExtension,
  getFileExtensionWithDot,
  getFileIcon,
  getFileColor,
} from './file-types';

// オブジェクト操作
export { shallowEqual } from './object';

// 数値操作
export { clamp } from './math';

// SSR/CSR環境判定
export { isBrowser, browserDocument, browserWindow } from './ssr';

// イベント操作
export { getEventCoordinates, type Point } from './event';

// 配列操作
export { wrapIndex, getNextIndex, getPrevIndex, reorderArray } from './array';

// ビューポート操作
export { constrainToViewport, type Size, type Position, type ConstrainOptions } from './viewport';

// ジェスチャー計算
export { getDelta, isVerticalDominant, exceedsThreshold, type Delta } from './gesture';

// ファイル操作
export { downloadAsFile } from './file-download';

// Monaco装飾
export { updateDecorationCollection, clearDecorationCollection } from './monaco-decorations';
