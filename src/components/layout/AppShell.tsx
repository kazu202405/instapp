"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { KeyboardShortcuts } from "@/components/layout/KeyboardShortcuts";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { LoginGate } from "@/components/layout/LoginGate";
import { useSidebarCollapsed } from "@/components/layout/useSidebarCollapsed";
import { cn } from "@/lib/utils";

/**
 * アプリケーション全体のシェルコンポーネント
 * - ログイン認証ゲートで保護
 * - デスクトップ: 左サイドバー + メインコンテンツ
 * - モバイル: メインコンテンツ + ボトムナビゲーション
 * - サイドバーの折りたたみ状態に応じてメインコンテンツのマージンを動的調整
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarCollapsed();

  return (
    <LoginGate>
      {/* ルート変更時にスクロールトップへ */}
      <ScrollToTop />

      {/* デスクトップ: サイドバー（md以上で表示） */}
      <Sidebar />

      {/* メインコンテンツ領域 */}
      <main
        className={cn(
          "min-h-svh pb-16 transition-all duration-300 ease-in-out md:pb-0",
          collapsed ? "md:ml-16" : "md:ml-60"
        )}
      >
        <div className="mx-auto max-w-5xl p-4 md:p-6">
          {children}
        </div>
      </main>

      {/* モバイル: ボトムナビゲーション（md未満で表示） */}
      <BottomNav />

      {/* グローバルキーボードショートカット */}
      <KeyboardShortcuts />
    </LoginGate>
  );
}
