# 改善実装チェックリスト

> 最終更新: 2026-02-25

## ステータス凡例

- ⬜ 未着手
- 🔄 進行中
- ✅ 完了
- ⏸️ 保留

---

## フェーズ1: クイックウィン

### パフォーマンス最適化

- ⬜ **P1-1**: EditorContainerのセレクター統合
  - ファイル: `components/editor/EditorContainer.tsx`
  - 行: 66-68
  - 内容: 3つの冗長なuseFileStoreサブスクリプションを1つに統合

- ⬜ **P1-2**: SplitPaneのアクション取得パターン修正
  - ファイル: `components/editor/SplitPane.tsx`
  - 行: 30
  - 内容: `getState()`でアクション取得、セレクターで状態取得

- ⬜ **P1-3**: FileTabsのアクション取得パターン修正
  - ファイル: `components/editor/FileTabs.tsx`
  - 行: 120-123
  - 内容: `getState()`でアクション取得、セレクターで状態取得

### エラーハンドリング

- ⬜ **P1-4**: EditorErrorBoundary作成
  - 新規ファイル: `components/editor/EditorErrorBoundary.tsx`
  - 内容: MonacoEditor用のErrorBoundary

- ⬜ **P1-5**: MonacoEditorにErrorBoundary適用
  - ファイル: `components/editor/SplitPane.tsx`
  - 内容: MonacoEditorをEditorErrorBoundaryでラップ

### コード整理

- ⬜ **P1-6**: shallowEqualをutils.tsに移動
  - 元: `components/settings/SettingsDialog.tsx`
  - 先: `lib/utils.ts`

- ⬜ **P1-7**: camelToKebabをutils.tsに移動
  - 元: `components/ThemeProvider.tsx`
  - 先: `lib/utils.ts`

---

## フェーズ2: 品質強化

### 状態管理リファクタリング

- ⬜ **P2-1**: SettingsDialogにuseReducer導入
  - ファイル: `components/settings/SettingsDialog.tsx`
  - 内容: 10+のuseStateをuseReducerに統合

- ⬜ **P2-2**: useDialogStateカスタムフック作成
  - 新規ファイル: `hooks/use-dialog-state.ts`
  - 内容: ダイアログ位置・サイズ管理ロジックの抽出

### 型安全性強化

- ⬜ **P2-3**: FileDataインターフェースの修正
  - ファイル: `lib/types/editor.ts`
  - 内容: isDirty, originalContentを必須に

- ⬜ **P2-4**: Zodスキーマの追加
  - 新規ファイル: `lib/schemas/file.ts`
  - 内容: FileData, EditorSettingsのバリデーション

- ⬜ **P2-5**: storage.tsにバリデーション追加
  - ファイル: `lib/store/storage.ts`
  - 内容: getItem時にZodでバリデーション

### テスト追加

- ⬜ **P2-6**: FileTabsコンポーネントテスト
  - 新規ファイル: `__tests__/components/FileTabs.test.tsx`
  - カバレッジ目標: 80%

- ⬜ **P2-7**: SearchDialogコンポーネントテスト
  - 新規ファイル: `__tests__/components/SearchDialog.test.tsx`
  - カバレッジ目標: 70%

- ⬜ **P2-8**: EditorContainerコンポーネントテスト
  - 新規ファイル: `__tests__/components/EditorContainer.test.tsx`
  - カバレッジ目標: 60%

---

## フェーズ3: 長期改善

### ドキュメント

- ⬜ **P3-1**: カスタムフックにJSDoc追加
  - 対象: `hooks/*.ts` 全ファイル
  - 内容: 関数説明、パラメータ、戻り値、使用例

- ⬜ **P3-2**: Zustandストアにドキュメント追加
  - 対象: `lib/store/*.ts` 全ファイル
  - 内容: ストアの目的、状態構造、アクション説明

### E2Eテスト

- ⬜ **P3-3**: Playwright導入
  - 新規ファイル: `playwright.config.ts`
  - 新規ディレクトリ: `e2e/`

- ⬜ **P3-4**: 基本E2Eテスト作成
  - 新規ファイル: `e2e/editor.spec.ts`
  - 内容: ファイル作成、編集、保存フロー

### 開発ツール

- ⬜ **P3-5**: Storybook導入
  - 新規設定: `.storybook/`
  - 対象コンポーネント: ui/, editor/

---

## 完了履歴

| 日付 | タスクID | 担当 | 備考 |
|------|----------|------|------|
| - | - | - | - |

---

## メモ

### 依存関係

```
P1-4 → P1-5 (ErrorBoundary作成後に適用)
P2-4 → P2-5 (Zodスキーマ作成後にstorage.tsに統合)
P3-3 → P3-4 (Playwright設定後にテスト作成)
```

### 参考コマンド

```bash
# テスト実行
npm run test:run

# カバレッジ確認
npm run test:coverage

# ビルド確認
npm run build

# 型チェック
npx tsc --noEmit
```
