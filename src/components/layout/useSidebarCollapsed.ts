"use client";

import { useSyncExternalStore, useCallback } from "react";

/** localStorageのキー */
const COLLAPSED_KEY = "sidebar-collapsed";

/**
 * サイドバー折りたたみ状態を購読するカスタムイベント
 * Sidebar と AppShell 間で状態を同期するために使用
 */
const SIDEBAR_EVENT = "sidebar-collapsed-change";

/** サーバーサイドレンダリング時のフォールバック値 */
function getServerSnapshot(): boolean {
  return false;
}

/** クライアントでlocalStorageから現在の状態を読み取る */
function getSnapshot(): boolean {
  return localStorage.getItem(COLLAPSED_KEY) === "true";
}

/** 外部ストアの購読（storage イベント + カスタムイベント） */
function subscribe(callback: () => void): () => void {
  // 同一タブ内のカスタムイベントを購読
  window.addEventListener(SIDEBAR_EVENT, callback);
  // 別タブからのstorage変更を購読
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(SIDEBAR_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/**
 * サイドバー折りたたみ状態を共有するフック
 * useSyncExternalStoreでSSR安全かつ複数コンポーネント間で同期
 */
export function useSidebarCollapsed() {
  const collapsed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const setCollapsed = useCallback((value: boolean) => {
    localStorage.setItem(COLLAPSED_KEY, String(value));
    // 同一タブ内の他コンポーネントに通知
    window.dispatchEvent(new Event(SIDEBAR_EVENT));
  }, []);

  const toggle = useCallback(() => {
    const current = localStorage.getItem(COLLAPSED_KEY) === "true";
    setCollapsed(!current);
  }, [setCollapsed]);

  return { collapsed, setCollapsed, toggle };
}
