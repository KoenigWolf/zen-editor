import type { MutableRefObject } from 'react';
import type { editor } from 'monaco-editor';

export const updateDecorationCollection = (
  ref: MutableRefObject<editor.IEditorDecorationsCollection | null>,
  editorInstance: editor.IStandaloneCodeEditor | null | undefined,
  decorations: editor.IModelDeltaDecoration[]
): void => {
  if (!editorInstance) return;

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
  ref: MutableRefObject<editor.IEditorDecorationsCollection | null>
): void => {
  if (ref.current) {
    ref.current.clear();
    ref.current = null;
  }
};
