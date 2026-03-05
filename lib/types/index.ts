/**
 * 型定義モジュール
 * 全ての共有型を一元管理
 */

// Editor settings
export type { EditorSettings } from './editor';
export { DEFAULT_EDITOR_SETTINGS } from './editor';

// Theme types
export type { ThemeColors, EditorTheme } from '@/lib/themes/types';

// Store types (re-exports)
export type { FileData } from '@/lib/store/file-store';
export type { SearchMatch } from '@/lib/store/search-store';
export type { SplitDirection, PaneSplit, PaneNode } from '@/lib/store/split-view-store';

// Hook types (re-exports)
export type { SearchOptions } from '@/hooks/editor/use-search-logic';
