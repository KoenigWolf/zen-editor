/**
 * ファイル種別ユーティリティ
 * 拡張子に基づくアイコンとカラーの定義
 */

import { FileCode2, FileJson2, FileType2, FileText, Code2, Braces } from 'lucide-react';

/** 拡張子 → アイコンコンポーネント */
export const FILE_ICON_MAP: Record<string, React.ElementType> = {
  json: FileJson2,
  ts: Braces,
  tsx: Braces,
  js: Braces,
  jsx: Braces,
  html: Code2,
  xml: Code2,
  md: FileText,
  txt: FileText,
  css: FileType2,
  scss: FileType2,
  less: FileType2,
};

/** 拡張子 → Tailwindカラークラス */
export const FILE_COLOR_MAP: Record<string, string> = {
  ts: 'text-blue-500',
  tsx: 'text-blue-500',
  js: 'text-yellow-500',
  jsx: 'text-yellow-500',
  json: 'text-green-500',
  css: 'text-pink-500',
  scss: 'text-pink-500',
  html: 'text-orange-500',
  md: 'text-purple-500',
};

/** デフォルトアイコン */
export const DEFAULT_FILE_ICON = FileCode2;

/** デフォルトカラークラス */
export const DEFAULT_FILE_COLOR = 'text-muted-foreground';

/** ファイル名から拡張子を取得（ドットなし） */
export const getFileExtension = (fileName: string): string =>
  fileName.split('.').pop()?.toLowerCase() || '';

/** ファイル名から拡張子を取得（ドット付き） */
export const getFileExtensionWithDot = (fileName: string): string => {
  const ext = getFileExtension(fileName);
  return ext ? `.${ext}` : '';
};

/** ファイル名からアイコンコンポーネントを取得 */
export const getFileIcon = (fileName: string): React.ElementType =>
  FILE_ICON_MAP[getFileExtension(fileName)] || DEFAULT_FILE_ICON;

/** ファイル名からカラークラスを取得 */
export const getFileColor = (fileName: string): string =>
  FILE_COLOR_MAP[getFileExtension(fileName)] || DEFAULT_FILE_COLOR;
