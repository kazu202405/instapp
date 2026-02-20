"use client";

import { useState, useCallback } from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { ShortcutHelp } from "@/components/layout/ShortcutHelp";

/**
 * キーボードショートカットプロバイダーコンポーネント
 * - useKeyboardShortcuts フックでグローバルショートカットを登録
 * - ShortcutHelp ダイアログの表示状態を管理
 * - AppShell内に配置して使用
 */
export function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);

  const handleShowHelp = useCallback(() => {
    setShowHelp(true);
  }, []);

  const shortcuts = useKeyboardShortcuts({
    onShowHelp: handleShowHelp,
  });

  return (
    <ShortcutHelp
      open={showHelp}
      onOpenChange={setShowHelp}
      shortcuts={shortcuts}
    />
  );
}
