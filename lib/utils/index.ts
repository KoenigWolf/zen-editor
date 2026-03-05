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
  getFileIcon,
  getFileColor,
} from './file-types';
