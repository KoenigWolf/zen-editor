/**
 * Hooks モジュール
 * 全てのカスタムフックを再エクスポート
 */

// Core hooks - 基本的な再利用可能フック
export { useMounted, useGlobalKeydown, useFocusTrap } from './core';

// Editor hooks - エディタ固有のフック
export {
  useEditorActions,
  useEditorOptions,
  useFileOperations,
  useFullWidthSpace,
  useKeyboardShortcuts,
  useMonacoTheme,
  useSearchLogic,
  type SearchOptions,
} from './editor';

// UI hooks - UI操作フック
export { useDialogDrag, useLongPress, useMouseDrag, useSwipeGesture } from './ui';

// Platform hooks - プラットフォーム/デバイス検出フック
export {
  useMobileDetection,
  useVirtualKeyboard,
  usePWA,
  usePWAManager,
  PWAContext,
  useWebVitals,
} from './platform';
