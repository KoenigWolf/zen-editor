import type { editor } from 'monaco-editor';

/**
 * Monaco装飾コレクションを更新（作成または更新）
 */
export const updateDecorationCollection = (
  ref: React.MutableRefObject<editor.IEditorDecorationsCollection | null>,
  editorInstance: editor.IStandaloneCodeEditor,
  decorations: editor.IModelDeltaDecoration[]
): void => {
  if (!ref.current) {
    ref.current = editorInstance.createDecorationsCollection(decorations);
  } else {
    ref.current.set(decorations);
  }
};

/**
 * Monaco装飾コレクションをクリア
 */
export const clearDecorationCollection = (
  ref: React.MutableRefObject<editor.IEditorDecorationsCollection | null>
): void => {
  if (ref.current) {
    ref.current.clear();
    ref.current = null;
  }
};
