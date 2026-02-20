// ============================================================
// InstaGrowth - リール台本ストア
// リール台本の生成履歴をZustand永続化ストアで管理
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReelScript } from '@/engine/reel/generator';

// リールストアのインターフェース
interface ReelStore {
  // 状態
  scripts: ReelScript[];

  // 台本操作
  addScript: (script: ReelScript) => void;
  removeScript: (id: string) => void;
  clearHistory: () => void;
}

// 保存する履歴の最大件数
const MAX_HISTORY = 50;

export const useReelStore = create<ReelStore>()(
  persist(
    (set) => ({
      // 初期状態
      scripts: [],

      // 台本を履歴に追加（最大件数を超えた場合は古いものを削除）
      addScript: (script) =>
        set((state) => ({
          scripts: [script, ...state.scripts].slice(0, MAX_HISTORY),
        })),

      // 指定IDの台本を削除
      removeScript: (id) =>
        set((state) => ({
          scripts: state.scripts.filter((s) => s.id !== id),
        })),

      // 全履歴をクリア
      clearHistory: () =>
        set({ scripts: [] }),
    }),
    {
      name: 'instagrowth-reels',
    }
  )
);
