"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useThemeStore, type Theme } from "@/store/themeStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** テーマの表示情報 */
const themeConfig: Record<Theme, { icon: typeof Moon; label: string }> = {
  dark: { icon: Moon, label: "ダークモード" },
  light: { icon: Sun, label: "ライトモード" },
  system: { icon: Monitor, label: "システム設定" },
};

/** テーマの切替順序: ダーク -> ライト -> システム -> ダーク... */
const themeOrder: Theme[] = ["dark", "light", "system"];

/**
 * テーマ切替ボタンコンポーネント
 * - 3状態サイクル: ダーク -> ライト -> システム -> ダーク...
 * - ツールチップでラベル表示
 * - クリック時にsonner toastで通知
 */
export function ThemeToggle({ collapsed }: { collapsed: boolean }) {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const currentIndex = themeOrder.indexOf(theme);
  const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
  const { icon: Icon, label } = themeConfig[theme];

  /** テーマを次の状態に切り替え */
  const handleToggle = () => {
    setTheme(nextTheme);
    const nextLabel = themeConfig[nextTheme].label;
    toast.success(`テーマを${nextLabel}に変更しました`);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleToggle}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
              "text-muted-foreground transition-all duration-200",
              "hover:bg-white/5 hover:text-white dark:hover:bg-white/5 dark:hover:text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "border-l-2 border-transparent",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? label : undefined}
            aria-label={`テーマ切替: 現在${label}`}
          >
            <Icon className="h-5 w-5 shrink-0 transition-colors duration-200" />
            {!collapsed && (
              <span className="truncate text-sm font-medium">{label}</span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          <p>
            現在: {label} / クリックで{themeConfig[nextTheme].label}に切替
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
