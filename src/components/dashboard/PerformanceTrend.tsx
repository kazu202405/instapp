"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { TrendingUp, BarChart3 } from "lucide-react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAnalysisStore } from "@/store/analysisStore";
import { formatDate } from "@/lib/utils";
import { isAfter, isBefore, parseISO, startOfDay } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateRangeFilter } from "@/components/analyzer/DateRangeFilter";
import { Skeleton } from "@/components/ui/skeleton";
import type { PostMetrics } from "@/lib/types";

/**
 * 表示可能なメトリクスキー
 */
type MetricKey = "engagementRate" | "saveRate" | "shareRate";

/**
 * メトリクス定義
 * ラベル、色、グラデーション情報を保持
 */
interface MetricConfig {
  key: MetricKey;
  label: string;
  color: string;
  gradientId: string;
}

/**
 * 利用可能なメトリクス一覧
 */
const METRICS: MetricConfig[] = [
  {
    key: "engagementRate",
    label: "エンゲージメント率",
    color: "#ec4899",
    gradientId: "gradEngagement",
  },
  {
    key: "saveRate",
    label: "保存率",
    color: "#a855f7",
    gradientId: "gradSave",
  },
  {
    key: "shareRate",
    label: "シェア率",
    color: "#f97316",
    gradientId: "gradShare",
  },
];

/**
 * チャートデータ型
 */
interface ChartDataPoint {
  date: string;
  score: number;
  engagementRate: number;
  saveRate: number;
  shareRate: number;
}

/**
 * 強化されたカスタムツールチップ
 * 総合スコアと有効化されている全メトリクスを表示する
 */
function EnhancedTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  // スコアエントリとメトリクスエントリを分離
  const scoreEntry = payload.find((p) => p.dataKey === "score");
  const metricEntries = payload.filter((p) => p.dataKey !== "score");

  return (
    <div className="rounded-lg border border-border bg-card/95 px-3 py-2 shadow-lg backdrop-blur-sm min-w-[140px]">
      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
      {scoreEntry && (
        <p className="text-sm font-semibold text-pink-400 mb-1">
          スコア: {scoreEntry.value}
        </p>
      )}
      {metricEntries.length > 0 && (
        <div className="border-t border-border pt-1 mt-1 space-y-0.5">
          {metricEntries.map((entry, index) => (
            <p
              key={index}
              className="text-xs"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      )}
    </div>
  );
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
      if (isBefore(postDate, start)) return false;
    }

    if (endDate) {
      const end = startOfDay(parseISO(endDate));
      if (isAfter(postDate, end)) return false;
    }

    return true;
  });
}

/**
 * パフォーマンス推移チャートコンポーネント
 * 総合スコアのライン表示に加え、エンゲージメント率・保存率・シェア率を
 * 個別にトグル可能なメトリクスラインとグラデーション塗りで表示する。
 * 日付範囲フィルター付き（コンパクト版・プリセットのみ）。
 */
export function PerformanceTrend() {
  const { posts, results } = useAnalysisStore();

  // チャート表示準備状態の管理（スケルトン→チャートへの遷移）
  const [isChartReady, setIsChartReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsChartReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // 有効化されているメトリクスの管理
  const [activeMetrics, setActiveMetrics] = useState<Set<MetricKey>>(
    new Set(["engagementRate"]),
  );

  // 日付範囲フィルターの状態
  const [dateRange, setDateRange] = useState<{
    start: string | null;
    end: string | null;
  }>({ start: null, end: null });

  /**
   * メトリクストグル操作
   */
  const toggleMetric = useCallback((key: MetricKey) => {
    setActiveMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  /** 日付範囲の変更ハンドラ */
  const handleRangeChange = useCallback(
    (startDate: string | null, endDate: string | null) => {
      setDateRange({ start: startDate, end: endDate });
    },
    [],
  );

  // フィルター適用後の投稿（結果を持つもの）
  const filteredPosts = useMemo(() => {
    const postsWithResults = posts.filter((post) => results[post.id]);
    return filterByDateRange(postsWithResults, dateRange.start, dateRange.end);
  }, [posts, results, dateRange.start, dateRange.end]);

  // 結果を持つ投稿の総数（フィルター前）
  const totalPostsWithResults = useMemo(
    () => posts.filter((post) => results[post.id]).length,
    [posts, results],
  );

  // チャートデータ生成: 日付順にスコアと各メトリクスを並べる
  const chartData = useMemo<ChartDataPoint[]>(() => {
    return filteredPosts
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((post) => {
        const result = results[post.id];
        return {
          date: formatDate(post.date, "MM/dd"),
          score: result.overallScore,
          engagementRate: Math.round(result.engagementRate * 100) / 100,
          saveRate: Math.round(result.saveRate * 100) / 100,
          shareRate: Math.round(result.shareRate * 100) / 100,
        };
      });
  }, [filteredPosts, results]);

  const hasData = chartData.length > 0;
  const hasAnyData = totalPostsWithResults > 0;

  return (
    <Card className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm h-full card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <TrendingUp className="size-4 text-pink-400" aria-hidden="true" />
          パフォーマンス推移
        </CardTitle>

        {/* 日付範囲フィルター（コンパクト版: プリセットのみ） */}
        {hasAnyData && (
          <div className="mt-3">
            <DateRangeFilter
              onRangeChange={handleRangeChange}
              totalCount={totalPostsWithResults}
              filteredCount={filteredPosts.length}
              compact
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {hasData && !isChartReady ? (
          <div className="h-64 space-y-3 p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : hasData ? (
          <>
            {/* メトリクストグルボタン */}
            <div
              className="flex flex-wrap gap-2 mb-4"
              role="group"
              aria-label="表示メトリクスの切り替え"
            >
              {METRICS.map((metric) => {
                const isActive = activeMetrics.has(metric.key);
                return (
                  <button
                    key={metric.key}
                    type="button"
                    onClick={() => toggleMetric(metric.key)}
                    className={`
                      flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium
                      transition-all duration-150 border
                      ${
                        isActive
                          ? "bg-white/10 border-white/20 text-white"
                          : "bg-transparent border-white/5 text-muted-foreground hover:text-foreground hover:border-white/10"
                      }
                    `}
                    aria-pressed={isActive}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: isActive ? metric.color : "#52525b",
                      }}
                    />
                    {metric.label}
                  </button>
                );
              })}
            </div>

            {/* チャート */}
            <div
              className="h-64 w-full"
              role="img"
              aria-label="パフォーマンス推移チャート"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                >
                  {/* グラデーション定義 */}
                  <defs>
                    <linearGradient
                      id="lineGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#9333ea" />
                      <stop offset="50%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                    <linearGradient
                      id="scoreAreaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#ec4899"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor="#ec4899"
                        stopOpacity={0.01}
                      />
                    </linearGradient>
                    {METRICS.map((metric) => (
                      <linearGradient
                        key={metric.gradientId}
                        id={metric.gradientId}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={metric.color}
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="95%"
                          stopColor={metric.color}
                          stopOpacity={0.01}
                        />
                      </linearGradient>
                    ))}
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#71717a", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  />
                  <YAxis
                    domain={[0, "auto"]}
                    tick={{ fill: "#71717a", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={35}
                  />
                  <Tooltip
                    content={<EnhancedTooltip />}
                    cursor={{
                      stroke: "rgba(236,72,153,0.3)",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                  />

                  {/* スコアエリア（グラデーション塗り） */}
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="スコア"
                    fill="url(#scoreAreaGradient)"
                    stroke="none"
                  />

                  {/* スコアライン */}
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="スコア"
                    stroke="url(#lineGradient)"
                    strokeWidth={2.5}
                    dot={{
                      fill: "#ec4899",
                      stroke: "#1c1917",
                      strokeWidth: 2,
                      r: 4,
                    }}
                    activeDot={{
                      fill: "#ec4899",
                      stroke: "#ec4899",
                      strokeWidth: 2,
                      r: 6,
                    }}
                  />

                  {/* 各メトリクスのエリア+ライン */}
                  {METRICS.map((metric) => {
                    if (!activeMetrics.has(metric.key)) return null;
                    return (
                      <Area
                        key={`area-${metric.key}`}
                        type="monotone"
                        dataKey={metric.key}
                        name={metric.label}
                        stroke={metric.color}
                        strokeWidth={1.5}
                        fill={`url(#${metric.gradientId})`}
                        dot={{
                          fill: metric.color,
                          stroke: "#1c1917",
                          strokeWidth: 1.5,
                          r: 3,
                        }}
                        activeDot={{
                          fill: metric.color,
                          stroke: metric.color,
                          strokeWidth: 2,
                          r: 5,
                        }}
                      />
                    );
                  })}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : hasAnyData ? (
          /* フィルターで結果が0件になった場合 */
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <BarChart3
              className="size-10 text-muted-foreground/50 mb-3"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              選択した期間にデータがありません
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              日付範囲を広げるか、「全期間」を選択してください
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <BarChart3
              className="size-10 text-muted-foreground/50 mb-3"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              データがまだありません
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              投稿を分析すると、パフォーマンス推移がここに表示されます
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
