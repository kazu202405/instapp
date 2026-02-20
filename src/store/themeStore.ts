// ============================================================
// InstaGrowth - テーマストア
// ダーク/ライト/システムのテーマ設定をZustand永続化ストアで管理
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** テーマの種類 */
export type Theme = "dark" | "light" | "system";

/** テーマストアのインターフェース */
interface ThemeStore {
  /** 現在のテーマ設定 */
  theme: Theme;
  /** テーマを変更する */
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      // 初期状態: ダークモード
      theme: "dark",

      // テーマを設定
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "instagrowth-theme",
    }
  )
);
