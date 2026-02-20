"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Target,
  TrendingUp,
  Bookmark,
  Share2,
  Brain,
  Lightbulb,
  FlaskConical,
} from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { RadarScore } from "@/components/analyzer/RadarScore";

interface ScoreDisplayProps {
  result: AnalysisResult;
}

/**
 * スコアの色を算出する
 * red <40, yellow 40-70, green >70
 */
function getScoreColor(score: number): {
  text: string;
  ring: string;
  gradient: string;
} {
  if (score < 40) {
    return {
      text: "text-red-400",
      ring: "#ef4444",
      gradient: "from-red-500 to-red-400",
    };
  }
  if (score <= 70) {
    return {
      text: "text-yellow-400",
      ring: "#eab308",
      gradient: "from-yellow-500 to-yellow-400",
    };
  }
  return {
    text: "text-emerald-400",
    ring: "#10b981",
    gradient: "from-emerald-500 to-emerald-400",
  };
}

/**
 * 円形スコアインジケーター
 * SVGリングで0-100のスコアを視覚的に表示
 */
function CircularScore({ score }: { score: number }) {
  const color = getScoreColor(score);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width="180"
        height="180"
        viewBox="0 0 180 180"
        className="-rotate-90"
        role="img"
        aria-label={`スコア: ${score}点`}
      >
        {/* 背景リング */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-white/5"
        />
        {/* スコアリング */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={color.ring}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* スコア数値 */}
      <div className="absolute flex flex-col items-center">
        <span className={`text-5xl font-bold ${color.text}`}>{score}</span>
        <span className="text-xs text-muted-foreground mt-1">/ 100</span>
      </div>
    </div>
  );
}

/**
 * ベンチマーク比較チャート用ツールチップ
 */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card/95 dark:bg-zinc-900/95 px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p
          key={index}
          className="text-xs"
          style={{ color: entry.color }}
        >
          {entry.name}: {entry.value}%
        </p>
      ))}
    </div>
  );
}

/**
 * 分析結果表示コンポーネント
 * スコア、ベンチマーク比較、診断、改善提案、A/Bテスト提案を表示
 */
export function ScoreDisplay({ result }: ScoreDisplayProps) {
  const {
    overallScore,
    engagementRate,
    saveRate,
    shareRate,
    benchmarkComparison,
    diagnosis,
    improvements,
    abTestSuggestion,
  } = result;

  // Recharts用データ
  const chartData = benchmarkComparison.map((item) => ({
    name: item.metric,
    "あなたの値": item.value,
    "ベンチマーク": item.benchmark,
  }));

  return (
    <div className="space-y-6">
      {/* スコアとレート概要 */}
      <Card className="border-white/5 bg-white/[0.03]">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-around">
            {/* 円形スコア */}
            <CircularScore score={overallScore} />

            {/* レートカード */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 w-full md:w-auto">
              <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
                <TrendingUp className="h-5 w-5 text-pink-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    エンゲージメント率
                  </p>
                  <p className="text-lg font-bold">{engagementRate}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
                <Bookmark className="h-5 w-5 text-purple-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">保存率</p>
                  <p className="text-lg font-bold">{saveRate}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
                <Share2 className="h-5 w-5 text-orange-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">シェア率</p>
                  <p className="text-lg font-bold">{shareRate}%</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* パフォーマンスレーダー */}
      <RadarScore result={result} />

      {/* ベンチマーク比較チャート */}
      <Card className="border-white/5 bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-pink-400" />
            ベンチマーク比較
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={false}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
              />
              <Bar
                dataKey="あなたの値"
                fill="url(#gradientBar)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="ベンチマーク"
                fill="#52525b"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <defs>
                <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 行動科学的診断 */}
      <Card className="border-white/5 bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-4 w-4 text-purple-400" />
            行動科学的診断
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {diagnosis}
          </p>
        </CardContent>
      </Card>

      {/* 改善アクション */}
      <Card className="border-white/5 bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4 text-yellow-400" />
            改善アクション
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {improvements.map((item, index) => (
              <div
                key={index}
                className="flex gap-3 rounded-xl bg-white/5 p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground pt-0.5">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* A/Bテスト提案 */}
      <Card className="border-white/5 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FlaskConical className="h-4 w-4 text-pink-400" />
            A/Bテスト提案
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {abTestSuggestion}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
