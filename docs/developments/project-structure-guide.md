# プロジェクト構造ガイド

## 目次

1. [プロジェクト構造](#プロジェクト構造)
2. [開発環境セットアップ](#開発環境セットアップ)
3. [コード品質ルール](#コード品質ルール)
4. [ディレクトリ規約](#ディレクトリ規約)
5. [開発ワークフロー](#開発ワークフロー)
6. [テスト規約](#テスト規約)
7. [Git 運用](#git運用)

---

## プロジェクト構造

### 全体構成

```
<project-root>/
├── app/                      # Next.js App Router
│   ├── styles/               # CSSモジュール
│   ├── globals.css           # グローバルスタイル
│   ├── layout.tsx            # ルートレイアウト
│   ├── error.tsx             # エラーページ
│   ├── global-error.tsx      # グローバルエラーページ
│   ├── metadata.ts           # メタデータ設定
│   ├── providers.tsx         # アプリケーションプロバイダー
│   └── page.tsx              # メインページ
├── components/               # Reactコンポーネント
│   ├── editor/               # エディター関連コンポーネント
│   │   ├── indent/           # インデントルーラー
│   │   │   ├── indent-ruler.tsx
│   │   │   ├── indent-handle.tsx
│   │   │   ├── indent-handle-config.tsx
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── search/           # 検索ダイアログ
│   │   │   ├── search-dialog.tsx
│   │   │   ├── search-option-button.tsx
│   │   │   ├── search-result-item.tsx
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   └── ...               # その他エディタコンポーネント
│   ├── settings/             # 設定関連コンポーネント
│   ├── pwa/                  # PWAプロンプトコンポーネント
│   ├── providers/            # コンテキストプロバイダー
│   │   ├── theme-provider.tsx
│   │   ├── pwa-provider.tsx
│   │   ├── root-provider.tsx # 全プロバイダー統合
│   │   └── index.ts
│   ├── layout/               # レイアウトコンポーネント
│   ├── seo/                  # SEOコンポーネント
│   └── ui/                   # 汎用UIコンポーネント（shadcn/ui）
├── hooks/                    # カスタムフック（ドメイン別）
│   ├── core/                 # 基本フック
│   │   ├── use-mounted.ts
│   │   ├── use-global-keydown.ts
│   │   ├── use-focus-trap.ts
│   │   └── index.ts
│   ├── editor/               # エディター固有フック
│   │   ├── use-editor-actions.ts
│   │   ├── use-editor-commands.ts  # コマンドパレット用
│   │   ├── use-tab-actions.ts      # タブ操作
│   │   ├── use-monaco-theme.ts
│   │   └── index.ts
│   ├── ui/                   # UI操作フック
│   │   ├── use-dialog-drag.ts
│   │   ├── use-mouse-drag.ts
│   │   └── index.ts
│   ├── platform/             # プラットフォーム検出
│   │   ├── use-mobile-detection.ts
│   │   ├── use-pwa.ts
│   │   └── index.ts
│   └── index.ts              # バレルエクスポート
├── lib/                      # ユーティリティ・状態管理
│   ├── config/               # 設定・定数・環境変数
│   │   ├── breakpoints.ts    # ブレークポイント定義
│   │   ├── editor.ts         # エディタオプション
│   │   ├── constants.ts      # 定数（ストレージキー、UI定数）
│   │   ├── env.ts            # 環境変数アクセス
│   │   ├── features.ts       # フィーチャーフラグ
│   │   └── index.ts
│   ├── utils/                # ユーティリティ関数（カテゴリ別）
│   │   ├── data/             # データ操作
│   │   │   ├── array.ts      # 配列操作（reorderArray, wrapIndex）
│   │   │   ├── math.ts       # 数値操作（clamp）
│   │   │   ├── object.ts     # オブジェクト操作（shallowEqual）
│   │   │   └── index.ts
│   │   ├── dom/              # DOM操作
│   │   │   ├── event.ts      # イベント座標取得
│   │   │   ├── gesture.ts    # ジェスチャー計算
│   │   │   ├── ssr.ts        # SSR安全なwindow/document
│   │   │   ├── viewport.ts   # ビューポート制限
│   │   │   └── index.ts
│   │   ├── editor/           # エディタ固有
│   │   │   ├── indent.ts     # インデント操作
│   │   │   ├── file-download.ts
│   │   │   ├── monaco-decorations.ts
│   │   │   └── index.ts
│   │   ├── cn.ts             # クラス名結合
│   │   ├── storage.ts        # localStorage
│   │   ├── security.ts       # バリデーション
│   │   ├── file-types.ts     # ファイルタイプ
│   │   └── index.ts          # 統一エクスポート
│   ├── store/                # Zustand状態管理
│   │   ├── editor-settings-store.ts
│   │   ├── file-store.ts
│   │   ├── search-store.ts
│   │   └── index.ts
│   ├── i18n/                 # 国際化設定
│   ├── themes/               # カスタムテーマ定義
│   └── types/                # 型定義（re-export含む）
├── __tests__/                # テストファイル
│   ├── hooks/                # フックのテスト
│   │   ├── core/             # coreフックのテスト
│   │   └── platform/         # platformフックのテスト
│   └── lib/                  # libのテスト
├── .github/
│   └── workflows/            # GitHub Actions CI/CD
├── docs/                     # ドキュメント
├── public/                   # 静的ファイル
├── .env.example              # 環境変数サンプル
├── vitest.config.ts          # Vitest設定
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### ディレクトリの役割

| ディレクトリ               | 役割                                          |
| -------------------------- | --------------------------------------------- |
| `app/`                     | Next.js App Router のルート・ページ           |
| `components/editor/`       | エディター固有のコンポーネント                |
| `components/editor/indent/`| インデントルーラー関連                        |
| `components/editor/search/`| 検索ダイアログ関連                            |
| `components/settings/`     | 設定画面のコンポーネント                      |
| `components/providers/`    | コンテキストプロバイダー（Theme, PWA, Root）  |
| `components/layout/`       | レイアウトコンポーネント（通知、スキップリンク）|
| `components/pwa/`          | PWA プロンプトコンポーネント                  |
| `components/ui/`           | 再利用可能な UI コンポーネント（shadcn/ui）   |
| `hooks/core/`              | 基本的な再利用可能フック                      |
| `hooks/editor/`            | エディター固有のフック                        |
| `hooks/ui/`                | UI操作フック（ドラッグ、スワイプ）            |
| `hooks/platform/`          | プラットフォーム検出フック（PWA、モバイル）   |
| `lib/config/`              | 設定・定数・環境変数・フィーチャーフラグ      |
| `lib/utils/data/`          | データ操作ユーティリティ（配列、数値、オブジェクト）|
| `lib/utils/dom/`           | DOM操作ユーティリティ（イベント、SSR）        |
| `lib/utils/editor/`        | エディタ固有ユーティリティ（インデント、ファイル）|
| `lib/store/`               | Zustand による状態管理                        |
| `lib/types/`               | TypeScript 型定義（re-export含む）            |
| `lib/i18n/`                | 国際化・翻訳ファイル                          |
| `__tests__/hooks/`         | フックのテスト（core/, platform/）            |
| `__tests__/lib/`           | ライブラリのテスト                            |
| `.github/workflows/`       | GitHub Actions CI/CD                          |
| `docs/`                    | 開発ドキュメント                              |

### ストア構成

| ストア                               | 役割                                 | 永続化 |
| ------------------------------------ | ------------------------------------ | ------ |
| `lib/store/editor-settings-store.ts` | エディター設定（フォント、テーマ等） | ○      |
| `lib/store/file-store.ts`            | ファイル管理（開いているファイル）   | ○      |
| `lib/store/split-view-store.ts`      | 分割ビュー（ツリー構造）             | ×      |
| `lib/store/search-store.ts`          | 検索機能（検索条件、マッチ結果）     | ×      |
| `lib/store/editor-instance-store.ts` | Monaco Editor インスタンス           | ×      |
| `lib/store/indent-store.ts`          | インデント設定                       | ×      |
| `lib/store/announcer-store.ts`       | aria-live アナウンス                 | ×      |

### ユーティリティ構成（lib/utils/）

カテゴリ別にサブディレクトリで整理：

| サブディレクトリ | 内容                                    | 主なエクスポート                         |
| ---------------- | --------------------------------------- | ---------------------------------------- |
| `data/`          | 純粋なデータ操作                        | `reorderArray`, `wrapIndex`, `clamp`, `shallowEqual` |
| `dom/`           | DOM/ブラウザ関連                        | `getEventCoordinates`, `isBrowser`, `constrainToViewport` |
| `editor/`        | エディタ固有の操作                      | `indentLines`, `downloadAsFile`, `updateDecorationCollection` |
| （ルート）       | 汎用ユーティリティ                      | `cn`, `validateSearchQuery`, `getFileIcon` |

**インポート方法**: `lib/utils/index.ts` から統一的にインポート可能

```typescript
import { reorderArray, isBrowser, indentLines, cn } from '@/lib/utils';
```

### 設定構成（lib/config/）

| ファイル          | 役割                                    |
| ----------------- | --------------------------------------- |
| `constants.ts`    | アプリ全体の定数（ストレージキー、UI定数） |
| `env.ts`          | 環境変数への型安全なアクセス            |
| `features.ts`     | フィーチャーフラグ管理                  |
| `editor.ts`       | エディタオプション                      |
| `breakpoints.ts`  | レスポンシブブレークポイント            |

---

## 開発環境セットアップ

### 前提条件

- Node.js 18 以上
- npm

### 技術スタック

| カテゴリ       | 技術                           |
| -------------- | ------------------------------ |
| フレームワーク | Next.js 15（App Router）       |
| 言語           | TypeScript 5.9 (Strict)        |
| 状態管理       | Zustand                        |
| UI ライブラリ  | shadcn/ui + Radix UI           |
| エディター     | Monaco Editor                  |
| スタイリング   | Tailwind CSS                   |
| 国際化         | i18next + react-i18next        |
| テスト         | Vitest + React Testing Library |
| CI/CD          | GitHub Actions                 |
| コード品質     | ESLint, Prettier, Husky        |

### 初期セットアップ

```bash
git clone <repository-url>
cd <project-root>
npm install
npm run dev
```

### 利用可能なスクリプト

```bash
npm run dev           # 開発サーバー起動
npm run build         # プロダクションビルド
npm run start         # プロダクションサーバー起動
npm run lint          # ESLint チェック
npm run format        # Prettier フォーマット
npm run test          # テスト実行（watch）
npm run test:run      # テスト実行（1回）
npm run test:coverage # カバレッジレポート
npm run typecheck     # 型チェック
```

---

## コード品質ルール

### 基本原則

1. **型安全性**: TypeScript の型を最大限活用
2. **一貫性**: プロジェクト全体で統一されたコーディングスタイル
3. **可読性**: コードは書くより読む時間の方が長い
4. **保守性**: 将来の変更に備えた設計

### コーディング規約

#### 関数定義

- アロー関数を使用（`const fn = () => {}`）
- 関数名は意図を明確に表現
- 単一責任原則を守る
- 不要なコメントは書かない（コードで意図を表現）

#### null/undefined の扱い

- オプショナルチェーン（`?.`）より明示的なガード節を優先
- 早期リターンで可読性を確保

#### export 規則

- `export *` は使用禁止（依存関係の追跡が困難になるため）
- 公開 API は最小限に保つ

### コンポーネント設計

- 使用場所の近くに配置（コロケーション原則）
- Props は単一責任で設計
- パフォーマンス最適化には useMemo/useCallback を活用

---

## ディレクトリ規約

### ファイル命名規則

| 種類           | 規則                  | 例                  |
| -------------- | --------------------- | ------------------- |
| コンポーネント | PascalCase            | `ComponentName.tsx` |
| フック         | ケバブケース + use-   | `use-hook-name.ts`  |
| ストア         | ケバブケース + -store | `file-store.ts`     |
| 型定義         | 機能名.ts             | `editor.ts`         |
| テスト         | \*.test.ts(x)         | `utils.test.ts`     |

### インポートパス

- `@/` エイリアスでプロジェクトルートからの絶対パスを使用
- 相対パス（`../`）は避ける

---

## 開発ワークフロー

### 状態管理（Zustand）

- **ストア設計**: 関心事ごとに分離（設定、ファイル、検索など）
- **永続化**: `persist` ミドルウェアでローカルストレージに保存
- **セレクタ**: 必要なデータのみ取得し、不要な再レンダリングを防止
- **バレルエクスポート**: `lib/store/index.ts` から統一的にインポート
- 実装例: `lib/store/editor-settings-store.ts`, `lib/store/file-store.ts`

### UI コンポーネント（shadcn/ui）

- Radix UI ベースのアクセシブルなコンポーネント
- `components/ui/` に配置
- Tailwind CSS でカスタマイズ可能

---

## テスト規約

### テストツール

- **Vitest** - テストランナー
- **React Testing Library** - コンポーネントテスト
- **jsdom** - ブラウザ環境シミュレーション

### 基本方針

| 対象               | テスト | 理由                     |
| ------------------ | ------ | ------------------------ |
| ユーティリティ関数 | ○      | 純粋関数、テストしやすい |
| ストアロジック     | ○      | ビジネスロジック集約     |
| UI コンポーネント  | △      | 複雑なロジックのみ       |

### テストファイルの配置

```
__tests__/
└── lib/
    ├── security.test.ts    # セキュリティ関連テスト
    └── utils.test.ts       # ユーティリティテスト
```

### テスト記述の原則

- **AAA パターン**: Arrange（準備）→ Act（実行）→ Assert（検証）
- **テスト名**: 何をテストしているか日本語で明確に記述
- **独立性**: 各テストは他のテストに依存しない

### テストコマンド

```bash
npm run test          # watch モードで実行
npm run test:run      # 1回だけ実行
npm run test:coverage # カバレッジ付きで実行
```

---

## Git 運用

### ブランチ戦略

| ブランチ    | 用途             |
| ----------- | ---------------- |
| `main`      | 本番環境         |
| `feature/`  | 機能開発         |
| `fix/`      | バグ修正         |
| `refactor/` | リファクタリング |

### コミットメッセージ

- **プレフィックス**: `feat:`, `fix:`, `refactor:`, `docs:` など
- **本文**: 変更内容を箇条書きで簡潔に

### コミット前の確認

コミット時に Husky + lint-staged で自動的に以下が実行されます：

- ESLint によるコードチェック・自動修正
- Prettier によるフォーマット

手動で確認する場合：

```bash
npm run test:run      # テスト実行
npm run typecheck     # 型チェック
npm run build         # ビルド確認
```

### CI/CD パイプライン

GitHub Actions で以下が自動実行されます：

1. **lint** - ESLint チェック
2. **typecheck** - TypeScript 型チェック
3. **test** - Vitest テスト実行
4. **build** - プロダクションビルド

---

## トラブルシューティング

| 問題                    | 対処法                                    |
| ----------------------- | ----------------------------------------- |
| 型エラー                | TypeScript の型定義を確認                 |
| `Cannot find module`    | `npm install` 実行、パスエイリアス確認    |
| ビルドエラー            | `.next` フォルダを削除して再ビルド        |
| Monaco Editor エラー    | バージョン確認                            |
| キャッシュ問題          | `node_modules` と `.next` を削除して再構築 |

---

## 関連ドキュメント

- [アーキテクチャ](../architecture/README.md)
- [UI コンポーネント](../components/ui-components.md)
- [エディタ](../components/editor.md)
- [国際化](../i18n/README.md)
