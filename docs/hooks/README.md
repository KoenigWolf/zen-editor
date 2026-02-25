# カスタムフック (Hooks) ガイド

Zen Editorでは、様々な状態管理やUIの共通処理をカスタムフックとして切り出し、再利用性と可読性を高めています。
このディレクトリには、プロジェクトで利用されている主要なカスタムフックの仕様と使い方を記載します。

## 概要

| フック名 | 用途 |
| --- | --- |
| `useMounted` | クライアントサイドでのコンポーネントのマウント検知 |
| `useMouseDrag` | スプリットペインなどのドラッグ＆ドロップ操作の共通化 |
| `useGlobalKeydown` | アプリケーション全体でのキーボードショートカット登録 |
| `usePWA` | PWA関連のステート（インストール状況、オフライン、アップデート検知）一元管理 |

---

## 1. `useMounted`
ハイドレーションエラー（Hydration Mismatch）を防ぐために、コンポーネントがブラウザ（クライアントサイド）で確実にマウントされたかどうかを判定します。

**使い方:**
```tsx
import { useMounted } from '@/hooks/use-mounted';

const MyComponent = () => {
  const mounted = useMounted();

  if (!mounted) return null; // サーバーサイドレンダリング時は何も表示しない

  return <div>Client-side only content</div>;
};
```

---

## 2. `useMouseDrag`
ウィンドウ分割バー (`SplitPane`) や設定ダイアログのリサイズなど、マウスポインタのドラッグ操作を共通化します。内部で `mousemove` と `mouseup` のリスナーをグローバルに管理し、不要なレンダリングを防ぎます。

**使い方:**
```tsx
import { useMouseDrag } from '@/hooks/use-mouse-drag';

const DraggableSplitter = () => {
  const { isDragging, startDrag } = useMouseDrag({
    onMove: (e, context) => {
      // マウス移動時の処理
      console.log('Dragging...', e.clientX, context);
    },
    onEnd: (context) => {
      // ドラッグ終了時の処理
    }
  });

  return (
    <div
      onMouseDown={(e) => startDrag(e, { initialX: e.clientX })}
      className={`splitter ${isDragging ? 'dragging' : ''}`}
    />
  );
};
```

---

## 3. `useGlobalKeydown`
特定のコンポーネントだけでなく、ウィンドウ全体で有効になるキーボードショートカットを登録します。

**使い方:**
```tsx
import { useGlobalKeydown } from '@/hooks/use-global-keydown';

const MyShortcutsProvider = () => {
  useGlobalKeydown({
    enabled: true,
    handler: (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveDocument();
      }
    }
  });

  return <div>...</div>;
};
```

---

## 4. `usePWA` / `usePWAManager` & `PWAContext`
PWAに関連するステート（アプリがインストール済みか、オフラインか、新しいアップデートがあるか）のロジックを一元管理します。
`hooks/usePWA.ts` の `usePWAManager` をルートの `PWAProvider` で呼び出し、その実行結果を `PWAContext` としてツリー全体に供給します。各コンポーネントは重複してイベントリスナーを登録することなく、`usePWA()` を呼び出すだけでPWAのステートを取得できます。

**使い方:**
```tsx
import { usePWA } from '@/hooks/usePWA';

const UpdateNotifier = () => {
  const { hasUpdate, applyUpdate, isOnline, canInstall, triggerInstall } = usePWA();

  if (!isOnline) {
    return <div>オフラインです</div>;
  }

  if (hasUpdate) {
    return <button onClick={applyUpdate}>新しいバージョンに更新</button>;
  }

  if (canInstall) {
    return <button onClick={triggerInstall}>アプリをインストール</button>;
  }

  return <div>最新の状態です</div>;
};
```
