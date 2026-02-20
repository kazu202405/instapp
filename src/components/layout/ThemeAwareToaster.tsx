"use client";

import { Toaster } from "sonner";
import { useThemeStore } from "@/store/themeStore";

/**
 * テーマに連動するToasterコンポーネント
 * - useThemeStore の値に応じて sonner の theme を切り替え
 * - "system" の場合は sonner にも "system" を渡す
 */
export function ThemeAwareToaster() {
  const theme = useThemeStore((s) => s.theme);

  return (
    <Toaster
      richColors
      theme={theme === "system" ? "system" : theme}
      position="bottom-right"
    />
  );
}
