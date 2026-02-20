"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  BarChart3,
  FileText,
  Film,
  UserCircle,
  FlaskConical,
  MoreHorizontal,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/** ボトムナビゲーションのメイン項目（常時表示される4つ） */
const mainNavItems = [
  { label: "ホーム", href: "/", icon: LayoutDashboard },
  { label: "キャプション", href: "/caption", icon: Sparkles },
  { label: "カレンダー", href: "/calendar", icon: CalendarDays },
  { label: "分析", href: "/analyzer", icon: BarChart3 },
];

/** 「もっと」ドロワー内に表示される追加項目 */
const moreNavItems = [
  { label: "テンプレート", href: "/templates", icon: FileText },
  { label: "リール台本", href: "/reel", icon: Film },
  { label: "プロフィール", href: "/profile", icon: UserCircle },
  { label: "A/Bテスト", href: "/abtest", icon: FlaskConical },
  { label: "設定", href: "/settings", icon: Settings },
];

/**
 * モバイル用ボトムナビゲーションコンポーネント
 * - 画面下部に固定表示（64px高）
 * - 4つのメインナビ項目 + 「もっと」ボタンで追加項目を表示
 * - アクティブ項目はグラデーションカラーで強調
 * - 背景はブラー効果付きダーク
 * - 「もっと」ボタンはSheet（ボトムドロワー）で追加ページへのリンクを表示
 */
export function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  /**
   * パスが現在のルートと一致するか判定
   */
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  /** 「もっと」内のいずれかのページがアクティブかどうか */
  const isMoreActive = moreNavItems.some((item) => isActive(item.href));

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "flex h-16 items-center justify-around",
        "border-t border-border bg-background/80 backdrop-blur-xl"
      )}
      aria-label="モバイルナビゲーション"
    >
      {/* メインナビ項目 */}
      {mainNavItems.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-1",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              active ? "text-transparent" : "text-muted-foreground"
            )}
            aria-current={active ? "page" : undefined}
          >
            {/* アクティブ時はグラデーション背景でアイコンを強調 */}
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
                active && "bg-gradient-to-r from-purple-600/20 to-pink-600/20"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  active ? "text-pink-400" : "text-muted-foreground"
                )}
              />
            </div>
            <span
              className={cn(
                "text-[10px] font-medium leading-tight",
                active
                  ? "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}

      {/* 「もっと」ボタン + ボトムシート */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-1",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              isMoreActive ? "text-transparent" : "text-muted-foreground"
            )}
            aria-label="その他のメニューを開く"
            aria-expanded={open}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
                isMoreActive &&
                  "bg-gradient-to-r from-purple-600/20 to-pink-600/20"
              )}
            >
              <MoreHorizontal
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  isMoreActive ? "text-pink-400" : "text-muted-foreground"
                )}
              />
            </div>
            <span
              className={cn(
                "text-[10px] font-medium leading-tight",
                isMoreActive
                  ? "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                  : "text-muted-foreground"
              )}
            >
              もっと
            </span>
          </button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl border-t border-border bg-background/95 backdrop-blur-xl pb-safe"
        >
          <SheetHeader>
            <SheetTitle className="text-foreground">その他の機能</SheetTitle>
            <SheetDescription className="text-muted-foreground text-sm">
              追加ページへのナビゲーション
            </SheetDescription>
          </SheetHeader>
          <nav className="grid grid-cols-2 gap-3 px-4 py-4" aria-label="追加メニュー">
            {moreNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl p-3",
                    "transition-all duration-200",
                    active
                      ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-foreground"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      active ? "text-pink-400" : "text-muted-foreground"
                    )}
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
