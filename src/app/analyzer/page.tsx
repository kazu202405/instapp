"use client";

import { BarChart3 } from "lucide-react";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { MetricsForm } from "@/components/analyzer/MetricsForm";
import { ScoreDisplay } from "@/components/analyzer/ScoreDisplay";
import { PostHistory } from "@/components/analyzer/PostHistory";
import { PostingHeatmap } from "@/components/analyzer/PostingHeatmap";
import { HashtagAnalytics } from "@/components/analyzer/HashtagAnalytics";
import { useAnalysisStore } from "@/store/analysisStore";

/**
 * 投稿分析ページ
 * メトリクス入力 -> スコアリング -> 行動科学的診断を一画面で提供
 */
export default function AnalyzerPage() {
  const { posts, results } = useAnalysisStore();

  // 最新の投稿の分析結果を取得
  const latestPost = posts[0];
  const latestResult = latestPost ? results[latestPost.id] : undefined;

  return (
    <AnimatedPage>
    <div className="space-y-8">
      {/* ページヘッダー */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            投稿分析
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-[3.25rem]">
          パフォーマンスを数値化し、行動科学で診断
        </p>
      </div>

      {/* メインコンテンツ: 入力フォームと結果 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* 左: 入力フォーム */}
        <div className="lg:col-span-2">
          <MetricsForm />
        </div>

        {/* 右: 分析結果 */}
        <div className="lg:col-span-3">
          {latestResult ? (
            <ScoreDisplay result={latestResult} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-sm">
                投稿メトリクスを入力して分析を開始してください
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                ベンチマーク比較、行動科学的診断、改善提案が表示されます
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 最適投稿時間ヒートマップ */}
      <PostingHeatmap />

      {/* ハッシュタグ分析 */}
      <HashtagAnalytics />

      {/* 履歴セクション */}
      <div>
        <PostHistory />
      </div>
    </div>
    </AnimatedPage>
  );
}
