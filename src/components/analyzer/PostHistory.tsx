"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Trash2, ChevronRight } from "lucide-react";
import { useAnalysisStore } from "@/store/analysisStore";
import { showUndoToast } from "@/lib/undoToast";
import { formatDate } from "@/lib/utils";
import { isAfter, isBefore, parseISO, startOfDay } from "date-fns";
import { DateRangeFilter } from "./DateRangeFilter";
import type { PostFormat, ContentPillar, PostMetrics } from "@/lib/types";

/** フォーマットの日本語ラベル */
const FORMAT_LABELS: Record<PostFormat, string> = {
  reel: "リール",
  carousel: "カルーセル",
  image: "画像",
  story: "ストーリーズ",
};

/** フォーマット別バッジ色 */
const FORMAT_COLORS: Record<PostFormat, string> = {
  reel: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  carousel: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  image: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  story: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

/** スコアの色クラス */
function getScoreTextColor(score: number): string {
  if (score < 40) return "text-red-400";
  if (score <= 70) return "text-yellow-400";
  return "text-emerald-400";
}

/**
 * 日付範囲でフィルタリングするユーティリティ
 */
function filterByDateRange(
  posts: PostMetrics[],
  startDate: string | null,
  endDate: string | null,
): PostMetrics[] {
  if (!startDate && !endDate) return posts;

  return posts.filter((post) => {
    const postDate = startOfDay(parseISO(post.date));

    if (startDate) {
      const start = startOfDay(parseISO(startDate));
      // 開始日より前の投稿を除外
      if (isBefore(postDate, start)) return false;
    }

    if (endDate) {
      const end = startOfDay(parseISO(endDate));
      // 終了日より後の投稿を除外
      if (isAfter(postDate, end)) return false;
    }

    return true;
  });
}

/**
 * 分析済み投稿の履歴一覧コンポーネント
 * カードをクリックすると詳細分析を表示する
 * 日付範囲フィルター付き
 */
export function PostHistory() {
  const { posts, results, removePost, addPost, setResult } = useAnalysisStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 日付範囲フィルターの状態
  const [dateRange, setDateRange] = useState<{
    start: string | null;
    end: string | null;
  }>({ start: null, end: null });

  /** 日付範囲の変更ハンドラ */
  const handleRangeChange = useCallback(
    (startDate: string | null, endDate: string | null) => {
      setDateRange({ start: startDate, end: endDate });
    },
    [],
  );

  /** フィルター適用後の投稿一覧 */
  const filteredPosts = useMemo(
    () => filterByDateRange(posts, dateRange.start, dateRange.end),
    [posts, dateRange.start, dateRange.end],
  );

  if (posts.length === 0) {
    return null;
  }

  return (
    <Card className="border-white/5 bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-muted-foreground" />
          分析履歴
          <Badge variant="secondary" className="ml-auto text-xs">
            {posts.length}件
          </Badge>
        </CardTitle>

        {/* 日付範囲フィルター */}
        <div className="mt-3">
          <DateRangeFilter
            onRangeChange={handleRangeChange}
            totalCount={posts.length}
            filteredCount={filteredPosts.length}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-center justify-center py-8 text-center"
            >
              <p className="text-sm text-muted-foreground">
                選択した期間に一致する投稿がありません
              </p>
            </motion.div>
          ) : (
            filteredPosts.map((post) => {
              const result = results[post.id];
              const isSelected = selectedId === post.id;

              return (
                <div key={post.id}>
                  {/* 履歴カード */}
                  <div
                    className={`group flex items-center gap-3 rounded-xl p-3 transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-white/10"
                        : "bg-white/5 hover:bg-white/[0.07]"
                    }`}
                    onClick={() =>
                      setSelectedId(isSelected ? null : post.id)
                    }
                    role="button"
                    tabIndex={0}
                    aria-expanded={isSelected}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedId(isSelected ? null : post.id);
                      }
                    }}
                  >
                    {/* 日付 */}
                    <div className="min-w-[5rem] text-sm text-muted-foreground">
                      {formatDate(post.date, "MM/dd")}
                    </div>

                    {/* フォーマットバッジ */}
                    <Badge
                      variant="outline"
                      className={`text-xs border ${FORMAT_COLORS[post.postFormat]}`}
                    >
                      {FORMAT_LABELS[post.postFormat]}
                    </Badge>

                    {/* スコア */}
                    {result && (
                      <span
                        className={`ml-auto text-lg font-bold tabular-nums ${getScoreTextColor(
                          result.overallScore
                        )}`}
                      >
                        {result.overallScore}
                      </span>
                    )}

                    {/* エンゲージメント率 */}
                    {result && (
                      <span className="text-xs text-muted-foreground min-w-[4rem] text-right">
                        ER {result.engagementRate}%
                      </span>
                    )}

                    {/* 展開アイコン */}
                    <ChevronRight
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        isSelected ? "rotate-90" : ""
                      }`}
                    />

                    {/* 削除ボタン */}
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        const deletedPost = post;
                        const deletedResult = results[post.id];
                        removePost(post.id);
                        if (isSelected) setSelectedId(null);
                        showUndoToast("分析を削除しました", () => {
                          addPost(deletedPost);
                          if (deletedResult) {
                            setResult(deletedPost.id, deletedResult);
                          }
                        });
                      }}
                      aria-label="この分析を削除"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* 展開時の詳細 */}
                  {isSelected && result && (
                    <div className="mt-2 rounded-xl bg-white/5 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                      {/* 指標一覧 */}
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
                        <div className="rounded-lg bg-white/5 p-2">
                          <span className="text-muted-foreground">リーチ</span>
                          <p className="font-semibold mt-0.5">
                            {post.reach.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white/5 p-2">
                          <span className="text-muted-foreground">いいね</span>
                          <p className="font-semibold mt-0.5">
                            {post.likes.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white/5 p-2">
                          <span className="text-muted-foreground">保存</span>
                          <p className="font-semibold mt-0.5">
                            {post.saves.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white/5 p-2">
                          <span className="text-muted-foreground">シェア</span>
                          <p className="font-semibold mt-0.5">
                            {post.shares.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* ベンチマーク比較 */}
                      <div className="space-y-1.5">
                        {result.benchmarkComparison.map((item) => (
                          <div
                            key={item.metric}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span className="w-28 text-muted-foreground truncate">
                              {item.metric}
                            </span>
                            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                style={{
                                  width: `${Math.min(item.percentile, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="w-10 text-right tabular-nums text-muted-foreground">
                              {item.percentile}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
