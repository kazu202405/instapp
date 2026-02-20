// ============================================================
// InstaGrowth - キャプションストア
// キャプション生成履歴と入力状態のZustand永続化ストア
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GeneratedCaption, CaptionInput } from '@/lib/types';

// キャプションストアのインターフェース
interface CaptionStore {
  // 状態
  captions: GeneratedCaption[]; // 生成履歴
  currentInput: Partial<CaptionInput>; // 現在の入力状態
  favorites: string[]; // お気に入りキャプションIDの配列

  // キャプション操作
  addCaption: (caption: GeneratedCaption) => void;
  removeCaption: (id: string) => void;
  clearHistory: () => void;

  // お気に入り操作
  toggleFavorite: (id: string) => void;

  // 入力状態操作
  setCurrentInput: (input: Partial<CaptionInput>) => void;
  resetCurrentInput: () => void;
}

// 入力状態の初期値
const defaultInput: Partial<CaptionInput> = {
  includeEmoji: true,
};

// 保存する履歴の最大件数
const MAX_HISTORY = 100;

export const useCaptionStore = create<CaptionStore>()(
  persist(
    (set) => ({
      // 初期状態
      captions: [],
      currentInput: { ...defaultInput },
      favorites: [],

      // キャプションを履歴に追加（最大件数を超えた場合は古いものを削除）
      addCaption: (caption) =>
        set((state) => ({
          captions: [caption, ...state.captions].slice(0, MAX_HISTORY),
        })),

      // 指定IDのキャプションを削除（お気に入りからも除去）
      removeCaption: (id) =>
        set((state) => ({
          captions: state.captions.filter((c) => c.id !== id),
          favorites: state.favorites.filter((fid) => fid !== id),
        })),

      // 全履歴をクリア
      clearHistory: () =>
        set({ captions: [], favorites: [] }),

      // お気に入りをトグル
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((fid) => fid !== id)
            : [...state.favorites, id],
        })),

      // 入力状態を部分更新（マージ）
      setCurrentInput: (input) =>
        set((state) => ({
          currentInput: { ...state.currentInput, ...input },
        })),

      // 入力状態を初期値にリセット
      resetCurrentInput: () =>
        set({ currentInput: { ...defaultInput } }),
    }),
    {
      name: 'instagrowth-captions',
    }
  )
);
