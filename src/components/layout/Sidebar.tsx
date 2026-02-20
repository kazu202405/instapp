"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  BarChart3,
  UserCircle,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  FileText,
  Film,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarCollapsed } from "@/components/layout/useSidebarCollapsed";
import { DataManager } from "@/components/layout/DataManager";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

/** サイドバーのナビゲーション項目 */
const navItems = [
  { label: "ダッシュボード", href: "/", icon: LayoutDashboard },
  { label: "キャプション生成", href: "/caption", icon: Sparkles },
  { label: "テンプレート", href: "/templates", icon: FileText },
  { label: "リール台本", href: "/reel", icon: Film },
  { label: "カレンダー", href: "/calendar", icon: CalendarDays },
  { label: "投稿分析", href: "/analyzer", icon: BarChart3 },
  { label: "プロフィール", href: "/profile", icon: UserCircle },
  { label: "A/Bテスト", href: "/abtest", icon: FlaskConical },
  { label: "設定", href: "/settings", icon: Settings },
];

/**
 * デスクトップ用サイドバーコンポーネント
 * - 240px幅（展開時）/ 64px幅（折りたたみ時）
 * - Instagram風グラデーションアクセント
 * - useSidebarCollapsed フックでAppShellと状態を共有
 */
export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarCollapsed();

  /**
   * パスが現在のルートと一致するか判定
   * "/"（ダッシュボード）は完全一致、それ以外は前方一致
   */
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-svh flex-col border-r border-border bg-sidebar md:flex",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* ロゴエリア */}
      <div className="flex h-16 items-center border-b border-border px-4">
        <Link
          href="/"
          className="flex items-center gap-2 overflow-hidden transition-all duration-300"
        >
          {/* グラデーションロゴアイコン */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="whitespace-nowrap bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-lg font-bold text-transparent">
              InstaGrowth
            </span>
          )}
        </Link>
      </div>

      {/* ナビゲーション */}
      <nav
        className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4"
        aria-label="メインナビゲーション"
      >
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5",
                "transition-all duration-200 ease-in-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-l-2 border-pink-500 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white"
                  : "border-l-2 border-transparent text-muted-foreground hover:bg-white/5 hover:text-white",
                collapsed && "justify-center px-2"
              )}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors duration-200",
                  active
                    ? "text-pink-400"
                    : "text-muted-foreground group-hover:text-white"
                )}
              />
              {!collapsed && (
                <span className="truncate text-sm font-medium">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* データ管理 + テーマ切替 + 折りたたみトグルボタン */}
      <div className="border-t border-border p-2 space-y-1">
        <DataManager collapsed={collapsed} />
        <ThemeToggle collapsed={collapsed} />
        <button
          onClick={toggle}
          className={cn(
            "flex w-full items-center justify-center rounded-lg p-2.5",
            "text-muted-foreground transition-colors duration-200",
            "hover:bg-white/5 hover:text-white",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          aria-label={collapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
