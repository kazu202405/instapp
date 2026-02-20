// ============================================================
// InstaGrowth - A/Bテストストア
// A/Bテスト管理のZustand永続化ストア
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ABTest } from '@/lib/types';

// A/Bテストストアのインターフェース
interface ABTestStore {
  // 状態
  tests: ABTest[]; // テスト一覧

  // 操作
  addTest: (test: ABTest) => void;
  updateTest: (id: string, updates: Partial<ABTest>) => void;
  removeTest: (id: string) => void;
  completeTest: (
    id: string,
    resultA: number,
    resultB: number,
    winner: 'A' | 'B' | null,
    learning: string
  ) => void;
}

// 保存するテストの最大件数
const MAX_TESTS = 100;

export const useABTestStore = create<ABTestStore>()(
  persist(
    (set) => ({
      // 初期状態
      tests: [],

      // テストを追加（最大件数制限あり）
      addTest: (test) =>
        set((state) => ({
          tests: [test, ...state.tests].slice(0, MAX_TESTS),
        })),

      // 指定IDのテストを部分更新
      updateTest: (id, updates) =>
        set((state) => ({
          tests: state.tests.map((test) =>
            test.id === id ? { ...test, ...updates } : test
          ),
        })),

      // 指定IDのテストを削除
      removeTest: (id) =>
        set((state) => ({
          tests: state.tests.filter((test) => test.id !== id),
        })),

      // テストを完了状態にする（結果と学びを記録）
      completeTest: (id, resultA, resultB, winner, learning) =>
        set((state) => ({
          tests: state.tests.map((test) =>
            test.id === id
              ? {
                  ...test,
                  resultA,
                  resultB,
                  winner,
                  learning,
                  status: 'completed' as const,
                  completedAt: new Date().toISOString(),
                }
              : test
          ),
        })),
    }),
    {
      name: 'instagrowth-abtest',
    }
  )
);
