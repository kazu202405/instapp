"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Hash, TrendingUp, Award, BarChart3 } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { useAnalysisStore } from "@/store/analysisStore";
import { useCaptionStore } from "@/store/captionStore";
import {
  analyzeHashtagPerformance,
  findBestHashtagSets,
  type HashtagPerformance,
  type HashtagSetPerformance,
} from "@/engine/hashtag/analytics";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// ============================================================
// メインコンポーネント
// ============================================================

export function HashtagAnalytics() {
  const { posts, results } = useAnalysisStore();
  const { captions } = useCaptionStore();

  // ハッシュタグ分析結果
  const hashtagPerformances = useMemo(
    () => analyzeHashtagPerformance(posts, results, captions),
    [posts, results, captions]
  );

  // ベストハッシュタグセット
  const bestSets = useMemo(
    () => findBestHashtagSets(captions, results, posts),
    [captions, results, posts]
  );

  // データが不足している場合の空状態
  if (hashtagPerformances.length === 0) {
    return (
      <Card className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div
              className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600/10 to-pink-600/10 mb-4"
              aria-hidden="true"
            >
              <Hash className="size-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground font-medium mb-1">
              ハッシュタグ分析データがありません
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              キャプション生成と投稿分析の両方のデータが蓄積されると、ハッシュタグ別のパフォーマンスが表示されます
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 上位10件のデータ（横棒グラフ用）
  const top10 = hashtagPerformances.slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* セクションヘッダー */}
      <div className="flex items-center gap-3">
        <div
          className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20"
          aria-hidden="true"
        >
          <Hash className="size-4 text-pink-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">ハッシュタグ分析</h2>
          <p className="text-xs text-muted-foreground">
            使用したハッシュタグのパフォーマンスを可視化
          </p>
        </div>
      </div>

      {/* 上位ハッシュタグ スコア比較グラフ */}
      <Card className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="size-4 text-purple-400" aria-hidden="true" />
            スコア比較（上位10件）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={top10}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={false}
                />
                <YAxis
                  dataKey="tag"
                  type="category"
                  width={120}
                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip content={<HashtagTooltip />} />
                <Bar dataKey="avgScore" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {top10.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(entry.avgScore)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 2カラムレイアウト: テーブルとワードクラウド */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* パフォーマンステーブル */}
        <Card className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="size-4 text-emerald-400" aria-hidden="true" />
              パフォーマンス一覧
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px]">
              <table className="w-full text-sm" aria-label="ハッシュタグパフォーマンス一覧">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left text-xs font-medium text-muted-foreground" scope="col">
                      タグ
                    </th>
                    <th className="pb-2 text-right text-xs font-medium text-muted-foreground" scope="col">
                      使用
                    </th>
                    <th className="pb-2 text-right text-xs font-medium text-muted-foreground" scope="col">
                      スコア
                    </th>
                    <th className="pb-2 text-right text-xs font-medium text-muted-foreground hidden sm:table-cell" scope="col">
                      ER
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {hashtagPerformances.map((tag, index) => (
                    <motion.tr
                      key={tag.tag}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.2 }}
                      className="border-b border-border/30 last:border-0"
                    >
                      <td className="py-2 text-muted-foreground font-mono text-xs">
                        {tag.tag}
                      </td>
                      <td className="py-2 text-right tabular-nums text-muted-foreground">
                        {tag.useCount}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        <span className={getScoreColorClass(tag.avgScore)}>
                          {tag.avgScore}
                        </span>
                      </td>
                      <td className="py-2 text-right tabular-nums text-muted-foreground hidden sm:table-cell">
                        {tag.avgEngagement}%
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* ワードクラウド的表示 */}
        <Card className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Hash className="size-4 text-blue-400" aria-hidden="true" />
              使用頻度マップ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="flex flex-wrap gap-2 items-center justify-center min-h-[280px] content-center"
              role="list"
              aria-label="ハッシュタグ使用頻度"
            >
              {hashtagPerformances.map((tag, index) => {
                const sizeClass = getTagSizeClass(
                  tag.useCount,
                  hashtagPerformances[0]?.useCount ?? 1
                );
                return (
                  <motion.div
                    key={tag.tag}
                    role="listitem"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        "transition-all cursor-default border-border/50",
                        sizeClass,
                        getTagColorClass(tag.avgScore)
                      )}
                      title={`使用: ${tag.useCount}回 / スコア: ${tag.avgScore}`}
                    >
                      {tag.tag}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ベストハッシュタグセット */}
      {bestSets.length > 0 && (
        <Card className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="size-4 text-amber-400" aria-hidden="true" />
              おすすめハッシュタグセット
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              過去の投稿でパフォーマンスが高かったハッシュタグの組み合わせ
            </p>
            <div className="space-y-3">
              {bestSets.slice(0, 3).map((set, index) => (
                <HashtagSetCard key={index} set={set} rank={index + 1} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

// ============================================================
// ハッシュタグセットカード
// ============================================================

function HashtagSetCard({
  set,
  rank,
}: {
  set: HashtagSetPerformance;
  rank: number;
}) {
  const rankColors = [
    "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
    "from-zinc-400/20 to-zinc-300/20 border-zinc-400/30",
    "from-orange-600/20 to-amber-600/20 border-orange-600/30",
  ];

  const rankEmojis = ["1st", "2nd", "3rd"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1, duration: 0.2 }}
      className={cn(
        "rounded-lg border bg-gradient-to-r p-4",
        rankColors[(rank - 1) % rankColors.length]
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {rankEmojis[(rank - 1) % rankEmojis.length]}
        </span>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            スコア:{" "}
            <span className={cn("font-semibold tabular-nums", getScoreColorClass(set.avgScore))}>
              {set.avgScore}
            </span>
          </span>
          <span>
            ER:{" "}
            <span className="font-semibold tabular-nums text-muted-foreground">
              {set.avgEngagement}%
            </span>
          </span>
          <span>使用: {set.useCount}回</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {set.tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="text-xs border-border/50 text-muted-foreground bg-card/80 dark:bg-zinc-900/40"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================================
// カスタムTooltip
// ============================================================

function HashtagTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: HashtagPerformance }> }) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-card/95 dark:bg-zinc-900/95 backdrop-blur-md px-3 py-2 shadow-xl">
      <p className="text-sm font-semibold text-foreground mb-1">{data.tag}</p>
      <div className="space-y-0.5 text-xs text-muted-foreground">
        <p>
          スコア:{" "}
          <span className={cn("font-semibold", getScoreColorClass(data.avgScore))}>
            {data.avgScore}
          </span>
        </p>
        <p>
          ER: <span className="text-foreground font-semibold">{data.avgEngagement}%</span>
        </p>
        <p>
          保存率: <span className="text-foreground font-semibold">{data.avgSaveRate}%</span>
        </p>
        <p>使用回数: {data.useCount}回</p>
        <p>最終使用: {formatDate(data.lastUsed)}</p>
      </div>
    </div>
  );
}

// ============================================================
// ユーティリティ関数
// ============================================================

/** スコアに応じたバーの色を返す */
function getBarColor(score: number): string {
  if (score >= 80) return "#10b981"; // emerald-500
  if (score >= 60) return "#eab308"; // yellow-500
  if (score >= 40) return "#f97316"; // orange-500
  return "#ef4444"; // red-500
}

/** スコアに応じたテキスト色クラスを返す */
function getScoreColorClass(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

/** 使用回数に応じたBadgeサイズクラスを返す（ワードクラウド風） */
function getTagSizeClass(count: number, maxCount: number): string {
  const ratio = count / Math.max(maxCount, 1);
  if (ratio >= 0.8) return "text-base px-3 py-1";
  if (ratio >= 0.5) return "text-sm px-2.5 py-0.5";
  if (ratio >= 0.3) return "text-xs px-2 py-0.5";
  return "text-[10px] px-1.5 py-0";
}

/** スコアに応じたBadge色クラスを返す */
function getTagColorClass(score: number): string {
  if (score >= 80) return "bg-emerald-950/30 text-emerald-300 hover:bg-emerald-950/50";
  if (score >= 60) return "bg-yellow-950/30 text-yellow-300 hover:bg-yellow-950/50";
  if (score >= 40) return "bg-orange-950/30 text-orange-300 hover:bg-orange-950/50";
  return "bg-muted/30 text-muted-foreground hover:bg-muted/50";
}
