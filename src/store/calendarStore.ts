// ============================================================
// InstaGrowth - カレンダーストア
// 投稿スケジュール管理のZustand永続化ストア
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CalendarEntry } from '@/lib/types';

// カレンダーストアのインターフェース
interface CalendarStore {
  // 状態
  entries: CalendarEntry[]; // カレンダーエントリ一覧
  viewMode: 'week' | 'month'; // 表示モード

  // エントリ操作
  setEntries: (entries: CalendarEntry[]) => void;
  addEntry: (entry: CalendarEntry) => void;
  updateEntry: (id: string, updates: Partial<CalendarEntry>) => void;
  removeEntry: (id: string) => void;

  // 表示モード操作
  setViewMode: (mode: 'week' | 'month') => void;
}

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set) => ({
      // 初期状態
      entries: [],
      viewMode: 'month',

      // エントリ一覧を一括設定（インポート等で使用）
      setEntries: (entries) =>
        set({ entries }),

      // エントリを追加（日付順にソートして挿入）
      addEntry: (entry) =>
        set((state) => {
          const updatedEntries = [...state.entries, entry].sort(
            (a, b) => {
              // 日付で昇順ソート、同日は時刻で昇順
              const dateCompare = a.date.localeCompare(b.date);
              if (dateCompare !== 0) return dateCompare;
              return a.time.localeCompare(b.time);
            }
          );
          return { entries: updatedEntries };
        }),

      // 指定IDのエントリを部分更新
      updateEntry: (id, updates) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        })),

      // 指定IDのエントリを削除
      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        })),

      // 表示モードを変更
      setViewMode: (mode) =>
        set({ viewMode: mode }),
    }),
    {
      name: 'instagrowth-calendar',
    }
  )
);
