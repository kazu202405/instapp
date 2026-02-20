"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

/** ショートカットの定義 */
export interface ShortcutDef {
  /** キー（小文字で指定） */
  key: string;
  /** Ctrlキー（Macの場合はCommand）が必要か */
  ctrl?: boolean;
  /** Shiftキーが必要か */
  shift?: boolean;
  /** ショートカットの説明 */
  description: string;
  /** カテゴリ */
  category: "navigation" | "action";
  /** 実行するアクション */
  action: () => void;
}

/**
 * グローバルキーボードショートカットフック
 * - input/textarea/select にフォーカス中は無効化
 * - ブラウザのデフォルト動作を preventDefault
 */
export function useKeyboardShortcuts({
  onShowHelp,
}: {
  onShowHelp: () => void;
}) {
  const router = useRouter();

  /** ショートカット定義リスト */
  const shortcuts: ShortcutDef[] = [
    {
      key: "d",
      ctrl: true,
      shift: true,
      description: "ダッシュボード",
      category: "navigation",
      action: () => router.push("/"),
    },
    {
      key: "g",
      ctrl: true,
      description: "キャプション生成",
      category: "navigation",
      action: () => router.push("/caption"),
    },
    {
      key: "a",
      ctrl: true,
      description: "投稿分析",
      category: "navigation",
      action: () => router.push("/analyzer"),
    },
    {
      key: "r",
      ctrl: true,
      shift: true,
      description: "カレンダー",
      category: "navigation",
      action: () => router.push("/calendar"),
    },
    {
      key: "/",
      description: "ショートカット一覧",
      category: "action",
      action: onShowHelp,
    },
  ];

  /** キーダウンイベントハンドラ */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // input/textarea/select/contenteditable にフォーカス中は無効化
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      if (
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl
          ? e.ctrlKey || e.metaKey
          : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && keyMatch) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, onShowHelp]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return shortcuts;
}
