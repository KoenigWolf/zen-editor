# Zen Editor 改善提案書

> 作成日: 2026-02-25
> 対象バージョン: 0.1.0
> 分析対象: プロジェクト全体

---

## 目次

1. [エグゼクティブサマリー](#1-エグゼクティブサマリー)
2. [現状分析](#2-現状分析)
3. [改善提案](#3-改善提案)
4. [優先度マトリックス](#4-優先度マトリックス)
5. [実装ロードマップ](#5-実装ロードマップ)

---

## 1. エグゼクティブサマリー

### プロジェクト概要

Zen Editorは、Next.js 15 + Monaco Editor + Zustandで構築されたモダンなWebベースのテキストエディタです。PWA対応、完全な日英バイリンガル対応、包括的なアクセシビリティ機能を備えています。

### 現在の品質スコア

| カテゴリ | スコア | 評価 |
|---------|--------|------|
| アーキテクチャ | 9/10 | 優秀 |
| パフォーマンス | 8/10 | 良好 |
| アクセシビリティ | 9.5/10 | 優秀 |
| 型安全性 | 9/10 | 優秀 |
| テストカバレッジ | 7/10 | 良好 |
| コード品質 | 8/10 | 良好 |
| i18n | 10/10 | 完璧 |
| ドキュメント | 7/10 | 良好 |

### 主要な改善領域

1. **パフォーマンス最適化** - Zustandセレクターの改善
2. **コード品質** - 重複コードの統合、複雑な状態管理の簡素化
3. **テスト強化** - コンポーネントテスト追加
4. **エラーハンドリング** - ErrorBoundaryの拡充
5. **開発者体験** - ドキュメント強化、型定義改善

---

## 2. 現状分析

### 2.1 技術スタック

```
フレームワーク: Next.js 15.5.9 (App Router, Static Export)
UI: React 18.3.1 + TypeScript 5.9.3
エディタ: Monaco Editor 0.55.1
状態管理: Zustand 4.5.2
スタイリング: Tailwind CSS 3.3.3 + shadcn/ui
i18n: i18next 23.10.1
テスト: Vitest 3.2.4 + Testing Library
```

### 2.2 プロジェクト統計

| 項目 | 数値 |
|------|------|
| コンポーネント数 | 36個 |
| カスタムフック数 | 18個 |
| Zustandストア数 | 7個 |
| 翻訳キー数 | 350+ |
| テストファイル数 | 9個 |
| 総コード行数 | ~15,000行 |

### 2.3 アーキテクチャ図

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │  EditorContainer, FileTabs, MonacoEditor, etc.  │    │
│  └─────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│                 State Management Layer                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │  7 Zustand Stores (File, Editor, Split, etc.)   │    │
│  │  + localStorage Persistence                      │    │
│  └─────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│                   Domain Logic Layer                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Security, Validation, Search Logic, Themes     │    │
│  └─────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                    │
│  ┌─────────────────────────────────────────────────┐    │
│  │  i18n, Monaco Config, Storage Utils             │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 3. 改善提案

### 3.1 パフォーマンス最適化

#### 3.1.1 Zustandセレクターの最適化

**現状の問題:**
```typescript
// EditorContainer.tsx - 冗長なサブスクリプション
const activeFile = useFileStore((state) => state.files.find(...));
const files = useFileStore((state) => state.files);           // 重複
const activeFileId = useFileStore((state) => state.activeFileId); // 重複
```

**改善案:**
```typescript
// 複合セレクターの作成
const useFileSelection = () => useFileStore(
  useCallback((state) => ({
    files: state.files,
    activeFileId: state.activeFileId,
    activeFile: state.files.find(f => f.id === state.activeFileId)
  }), [])
);

// コンポーネントでの使用
const { files, activeFileId, activeFile } = useFileSelection();
```

**効果:** 3つのサブスクリプションを1つに統合、不要な再レンダリング削減

---

#### 3.1.2 アクション取得パターンの改善

**現状の問題:**
```typescript
// 状態とアクションを一緒に取得 → 全状態変更で再レンダリング
const { setActivePane, activePaneId, closePane } = useSplitViewStore();
```

**改善案:**
```typescript
// 状態のみセレクターで取得
const activePaneId = useSplitViewStore((state) => state.activePaneId);

// アクションはgetState()で取得（再レンダリングを引き起こさない）
const { setActivePane, closePane } = useSplitViewStore.getState();
```

---

#### 3.1.3 メモ化の改善

**追加すべきメモ化:**

| 場所 | 対象 | 理由 |
|------|------|------|
| `SettingsDialog.tsx` | リサイズヘルパー関数 | ドラッグ中に毎フレーム再生成 |
| `FileTabs.tsx` | FILE_ICON_MAP/FILE_COLOR_MAP | コンポーネント外に移動済み、十分 |
| `SearchDialog.tsx` | 検索オプションオブジェクト | 毎レンダリングで再生成 |

---

### 3.2 コード品質改善

#### 3.2.1 SettingsDialogの状態管理簡素化

**現状の問題:** 10以上のuseState（position, size, isResizing, resizeDirection等）

**改善案:** useReducerへの移行

```typescript
type DialogState = {
  position: { x: number; y: number };
  size: { width: number; height: number };
  isResizing: boolean;
  isDragging: boolean;
  resizeDirection: ResizeDirection | null;
};

type DialogAction =
  | { type: 'START_DRAG'; payload: { x: number; y: number } }
  | { type: 'DRAG'; payload: { x: number; y: number } }
  | { type: 'END_DRAG' }
  | { type: 'START_RESIZE'; payload: ResizeDirection }
  | { type: 'RESIZE'; payload: { width: number; height: number } }
  | { type: 'END_RESIZE' };

const dialogReducer = (state: DialogState, action: DialogAction): DialogState => {
  // ...
};
```

---

#### 3.2.2 共通ユーティリティの抽出

**抽出候補:**

| 関数 | 現在の場所 | 提案 |
|------|-----------|------|
| `getFileExtension` | FileTabs.tsx | `lib/utils.ts`へ移動 |
| `shallowEqual` | SettingsDialog.tsx | `lib/utils.ts`へ移動 |
| `camelToKebab` | ThemeProvider.tsx | `lib/utils.ts`へ移動 |

---

#### 3.2.3 型安全性の強化

**改善案:**

```typescript
// lib/types/editor.ts - オプショナルを必須に
interface FileData {
  id: string;
  name: string;
  content: string;
  path: string;
  lastModified: number;
  isDirty: boolean;        // ? を削除
  originalContent: string;  // ? を削除
}

// 永続化データのバリデーション追加
import { z } from 'zod';

const FileDataSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  content: z.string(),
  // ...
});

// storage.ts での使用
getItem: (name) => {
  const raw = localStorage.getItem(name);
  const parsed = JSON.parse(raw);
  return FileDataSchema.parse(parsed); // バリデーション
}
```

---

### 3.3 エラーハンドリング強化

#### 3.3.1 ErrorBoundaryの拡充

**現状:** グローバルErrorBoundaryのみ

**改善案:** 粒度の細かいErrorBoundary

```typescript
// components/editor/EditorErrorBoundary.tsx
export const EditorErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary
    fallback={({ error, resetErrorBoundary }) => (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p>{t('error.editorCrash')}</p>
        <Button onClick={resetErrorBoundary}>{t('error.retry')}</Button>
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
);

// 使用例
<EditorErrorBoundary>
  <MonacoEditor />
</EditorErrorBoundary>
```

**適用箇所:**
- MonacoEditor
- SearchDialog
- SettingsDialog
- CommandPalette

---

#### 3.3.2 非同期エラーハンドリング

```typescript
// hooks/use-file-operations.ts
const handleOpen = useCallback(async () => {
  try {
    const input = document.createElement('input');
    // ...
    const file = input.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      toast({
        title: t('error.invalidFile'),
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    const content = await file.text();
    addFile({ name: file.name, content });
  } catch (error) {
    toast({
      title: t('error.fileReadFailed'),
      description: error instanceof Error ? error.message : t('error.unknown'),
      variant: 'destructive',
    });
  }
}, [addFile, toast, t]);
```

---

### 3.4 テスト強化

#### 3.4.1 コンポーネントテストの追加

**優先度の高いテスト対象:**

| コンポーネント | 理由 | 推定工数 |
|--------------|------|---------|
| EditorContainer | メインオーケストレーター | 大 |
| FileTabs | ドラッグ&ドロップロジック | 中 |
| SearchDialog | 複雑な検索ロジック | 中 |
| SettingsDialog | 多数の設定操作 | 大 |

**テスト例:**
```typescript
// __tests__/components/FileTabs.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { FileTabs } from '@/components/editor/FileTabs';

describe('FileTabs', () => {
  it('アクティブタブが正しくハイライトされる', () => {
    render(<FileTabs />);
    const activeTab = screen.getByRole('tab', { selected: true });
    expect(activeTab).toHaveClass('mochi-tab-active');
  });

  it('タブをクリックするとアクティブになる', () => {
    render(<FileTabs />);
    const tab = screen.getByText('test.txt');
    fireEvent.click(tab);
    expect(tab).toHaveAttribute('aria-selected', 'true');
  });

  it('ドラッグ&ドロップでタブを並び替えできる', () => {
    // ...
  });
});
```

---

#### 3.4.2 E2Eテストの導入

**推奨ツール:** Playwright

```typescript
// e2e/editor.spec.ts
import { test, expect } from '@playwright/test';

test('新規ファイル作成からコンテンツ編集まで', async ({ page }) => {
  await page.goto('/');

  // 新規ファイル作成
  await page.keyboard.press('Meta+n');
  await expect(page.getByRole('tab', { name: /untitled/i })).toBeVisible();

  // コンテンツ入力
  const editor = page.locator('.monaco-editor');
  await editor.click();
  await page.keyboard.type('Hello, World!');

  // 保存
  await page.keyboard.press('Meta+s');
  // ...
});
```

---

### 3.5 アクセシビリティ強化

#### 3.5.1 フォーカスインジケーターのカスタマイズ

```css
/* app/styles/accessibility.css に追加 */
:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}

.focus-ring {
  @apply focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2;
}
```

---

#### 3.5.2 キーボードナビゲーションの改善

**改善案:**
- Escapeキーでモーダルを閉じる際のフォーカス復帰の改善
- タブパネル間のArrowキーナビゲーション
- エディタ領域へのショートカット（Alt+1）

---

### 3.6 開発者体験の向上

#### 3.6.1 JSDocコメントの追加

```typescript
/**
 * ファイルの拡張子を取得する
 * @param fileName - ファイル名（例: "document.txt"）
 * @returns 拡張子（ドットなし、小文字、例: "txt"）
 * @example
 * getFileExtension("document.txt") // "txt"
 * getFileExtension("archive.tar.gz") // "gz"
 */
export const getFileExtension = (fileName: string): string =>
  fileName.split('.').pop()?.toLowerCase() || '';
```

---

#### 3.6.2 Storybook導入

```typescript
// stories/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'default',
    children: 'Button',
  },
};
```

---

### 3.7 バンドルサイズ最適化

#### 3.7.1 現状分析

```
Total First Load JS: 283 kB
├── Monaco Editor: ~150 kB (async)
├── Radix UI: ~40 kB
├── React + Next.js: ~50 kB
└── App Code: ~43 kB
```

#### 3.7.2 最適化案

| 対策 | 削減見込み | 複雑度 |
|------|-----------|--------|
| Monaco言語サポートの遅延読み込み | ~30 kB | 中 |
| lucide-reactのTree Shaking確認 | ~5 kB | 低 |
| Radix UIコンポーネントの個別インポート | 既に実施済み | - |

---

### 3.8 セキュリティ強化

#### 3.8.1 CSPの厳格化

```javascript
// next.config.js
// 'unsafe-inline' を削除してnonceベースに移行
headers: [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'nonce-{RANDOM}';
      style-src 'self' 'nonce-{RANDOM}';
    `.replace(/\s+/g, ' ').trim()
  }
]
```

#### 3.8.2 依存関係の監査

```bash
# 定期的な脆弱性チェック
npm audit
npx npm-check-updates -u
```

---

## 4. 優先度マトリックス

### 高優先度（即時対応推奨）

| 改善項目 | 影響度 | 工数 | ROI |
|---------|--------|------|-----|
| Zustandセレクター最適化 | 高 | 低 | ★★★★★ |
| ErrorBoundary拡充 | 中 | 低 | ★★★★☆ |
| アクション取得パターン改善 | 中 | 低 | ★★★★☆ |

### 中優先度（計画的に対応）

| 改善項目 | 影響度 | 工数 | ROI |
|---------|--------|------|-----|
| SettingsDialog状態管理簡素化 | 中 | 中 | ★★★☆☆ |
| コンポーネントテスト追加 | 高 | 高 | ★★★☆☆ |
| 共通ユーティリティ抽出 | 低 | 低 | ★★★☆☆ |

### 低優先度（余裕があれば対応）

| 改善項目 | 影響度 | 工数 | ROI |
|---------|--------|------|-----|
| Storybook導入 | 低 | 高 | ★★☆☆☆ |
| E2Eテスト導入 | 中 | 高 | ★★☆☆☆ |
| CSP厳格化 | 低 | 中 | ★★☆☆☆ |

---

## 5. 実装ロードマップ

### フェーズ1: クイックウィン

**対象:** 低工数・高効果の改善

- [ ] Zustandセレクターの最適化（3.1.1, 3.1.2）
- [ ] ErrorBoundaryの追加（3.3.1）
- [ ] 共通ユーティリティの抽出（3.2.2）

### フェーズ2: 品質強化

**対象:** コード品質とテストの改善

- [ ] SettingsDialog状態管理のリファクタリング（3.2.1）
- [ ] 型安全性の強化（3.2.3）
- [ ] コンポーネントテストの追加（3.4.1）

### フェーズ3: 長期改善

**対象:** 開発者体験とインフラ整備

- [ ] JSDocコメント追加（3.6.1）
- [ ] E2Eテスト導入（3.4.2）
- [ ] Storybook導入（3.6.2）

---

## 付録

### A. ファイル構成

```
docs/improvements/
├── IMPROVEMENT_PROPOSAL.md    # 本ドキュメント
├── implementation/            # 実装ガイド（今後追加）
│   ├── selectors.md
│   ├── error-boundaries.md
│   └── testing.md
└── reports/                   # 分析レポート（今後追加）
    ├── performance.md
    └── bundle-analysis.md
```

### B. 参考リソース

- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Docs](https://playwright.dev/docs/intro)

---

*本ドキュメントはClaudeによる自動分析に基づいて生成されました。*
