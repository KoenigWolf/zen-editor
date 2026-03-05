/**
 * フィーチャーフラグ
 * 新機能の有効/無効を制御
 */

export const FEATURES = {
  // 有効な機能
  SPLIT_VIEW: true,
  SEARCH_AND_REPLACE: true,
  INDENT_RULER: true,
  FULLWIDTH_SPACE_HIGHLIGHT: true,
  PWA: true,
  COMMAND_PALETTE: true,

  // 開発中・無効な機能
  COLLABORATIVE_EDITING: false,
  AI_SUGGESTIONS: false,
  VIM_MODE: false,
  GIT_INTEGRATION: false,
  FILE_SYSTEM_ACCESS: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;

/**
 * フィーチャーフラグの有効状態を確認
 */
export const isFeatureEnabled = (feature: FeatureKey): boolean => FEATURES[feature];
