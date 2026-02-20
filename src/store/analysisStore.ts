// ============================================================
// InstaGrowth - 投稿分析ストア
// 投稿メトリクスと分析結果のZustand永続化ストア
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PostMetrics, AnalysisResult } from '@/lib/types';

// 投稿分析ストアのインターフェース
interface AnalysisStore {
  // 状態
  posts: PostMetrics[]; // 分析した投稿一覧
  results: Record<string, AnalysisResult>; // 投稿IDごとの分析結果

  // 投稿操作
  addPost: (post: PostMetrics) => void;
  removePost: (id: string) => void;
  clearPosts: () => void;

  // 分析結果操作
  setResult: (postId: string, result: AnalysisResult) => void;
  removeResult: (postId: string) => void;
}

// 保存する投稿の最大件数
const MAX_POSTS = 200;

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set) => ({
      // 初期状態
      posts: [],
      results: {},

      // 投稿を追加（重複IDは上書き、最大件数制限あり）
      addPost: (post) =>
        set((state) => {
          // 既存の投稿と同じIDがあれば更新、なければ先頭に追加
          const existingIndex = state.posts.findIndex((p) => p.id === post.id);
          let updatedPosts: PostMetrics[];

          if (existingIndex >= 0) {
            updatedPosts = [...state.posts];
            updatedPosts[existingIndex] = post;
          } else {
            updatedPosts = [post, ...state.posts].slice(0, MAX_POSTS);
          }

          return { posts: updatedPosts };
        }),

      // 投稿とその分析結果を削除
      removePost: (id) =>
        set((state) => {
          const { [id]: _removed, ...remainingResults } = state.results;
          return {
            posts: state.posts.filter((p) => p.id !== id),
            results: remainingResults,
          };
        }),

      // 全投稿と分析結果をクリア
      clearPosts: () =>
        set({ posts: [], results: {} }),

      // 投稿IDに対する分析結果を設定
      setResult: (postId, result) =>
        set((state) => ({
          results: { ...state.results, [postId]: result },
        })),

      // 指定投稿IDの分析結果を削除
      removeResult: (postId) =>
        set((state) => {
          const { [postId]: _removed, ...remainingResults } = state.results;
          return { results: remainingResults };
        }),
    }),
    {
      name: 'instagrowth-analysis',
    }
  )
);
