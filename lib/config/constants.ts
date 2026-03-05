/**
 * アプリケーション全体で使用する定数
 */

// ストレージ制限
export const STORAGE = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  KEYS: {
    EDITOR_SETTINGS: 'editor-settings',
    THEME: 'zen-editor-theme',
    SEARCH_HISTORY: 'zen-editor-search-history',
  },
} as const;

// 分割ペイン
export const SPLIT_PANE = {
  DEFAULT_RATIO: 0.5,
  MIN_RATIO: 0.2,
  MAX_RATIO: 0.8,
} as const;

// 検索
export const SEARCH = {
  MAX_HISTORY: 20,
  DEBOUNCE_MS: 100,
} as const;

// UI
export const UI = {
  ANIMATION_DURATION_MS: 200,
  TOAST_DURATION_MS: 2000,
  LONG_PRESS_THRESHOLD_MS: 500,
  SWIPE_THRESHOLD_PX: 50,
  MOVE_THRESHOLD_PX: 10,
} as const;

// エディタ
export const EDITOR = {
  MIN_FONT_SIZE: 8,
  MAX_FONT_SIZE: 72,
  DEFAULT_FONT_SIZE: 14,
  DEFAULT_TAB_SIZE: 2,
  LINE_HEIGHT: 1.6,
} as const;
