// ============================================================
// InstaGrowth - 設定ストア
// デフォルトジャンル・投稿時間などのアプリ設定をZustand永続化ストアで管理
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

// 設定ストアのインターフェース
interface SettingsStore {
  // 状態
  defaultGenre: string; // デフォルトジャンル
  defaultPostTime: string; // デフォルト投稿時間（HH:mm形式）

  // 操作
  setDefaultGenre: (genre: string) => void;
  setDefaultPostTime: (time: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // 初期状態
      defaultGenre: "",
      defaultPostTime: "19:00",

      // デフォルトジャンルを設定
      setDefaultGenre: (genre) => set({ defaultGenre: genre }),

      // デフォルト投稿時間を設定
      setDefaultPostTime: (time) => set({ defaultPostTime: time }),
    }),
    {
      name: "instagrowth-settings",
    }
  )
);
