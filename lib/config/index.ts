/**
 * 設定・定数モジュール
 */

// ブレークポイント・デバウンス
export { BREAKPOINTS, DEBOUNCE } from './breakpoints';

// エディタ設定
export {
  getLanguageFromFilename,
  getEolLabel,
  shouldHighlightFullWidthSpace,
  DEFAULT_EDITOR_OPTIONS,
} from './editor';

// 定数
export { STORAGE, SPLIT_PANE, SEARCH, UI, EDITOR } from './constants';

// フィーチャーフラグ
export { FEATURES, isFeatureEnabled, type FeatureKey } from './features';

// 環境変数
export { env, isDevelopment, isProduction, isTest } from './env';
