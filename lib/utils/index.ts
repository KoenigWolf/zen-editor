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

// データ操作 (data/)
export { wrapIndex, getNextIndex, getPrevIndex, reorderArray, clamp, shallowEqual } from './data';

// DOM操作 (dom/)
export {
  getEventCoordinates,
  getDelta,
  isVerticalDominant,
  exceedsThreshold,
  isBrowser,
  browserDocument,
  browserWindow,
  constrainToViewport,
  type Point,
  type Delta,
  type Size,
  type Position,
  type ConstrainOptions,
} from './dom';

// エディタ固有 (editor/)
export {
  downloadAsFile,
  indentLines,
  outdentLines,
  updateDecorationCollection,
  clearDecorationCollection,
} from './editor';
