"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

/**
 * テーマプロバイダーコンポーネント
 * - document.documentElement.classList の "dark" クラスを切り替え
 * - "system" の場合は matchMedia でシステム設定を検知
 * - layout.tsx の html タグは初期値 className="dark" を維持し、
 *   このコンポーネントがマウント後にクラスを適切に設定する（フラッシュ防止）
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    /**
     * 実際にダークモードを適用すべきかを判定し、
     * html要素のclassListを切り替える
     */
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    if (theme === "system") {
      // システム設定に追従
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mediaQuery.matches);

      // システム設定変更時のリスナー
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches);
      };
      mediaQuery.addEventListener("change", handleChange);

      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    }

    // dark / light の場合は直接適用
    applyTheme(theme === "dark");
  }, [theme]);

  return <>{children}</>;
}
