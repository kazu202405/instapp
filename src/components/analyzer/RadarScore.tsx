"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Hexagon } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";

interface RadarScoreProps {
  result: AnalysisResult;
}

/**
 * レーダーチャート用データ項目
 */
interface RadarDataItem {
  dimension: string;
  user: number;
  benchmark: number;
}

/**
 * AnalysisResultからレーダーチャート用の5次元データを生成する
 * benchmarkComparisonのpercentile値をそのまま使用し、
 * ベンチマークは常に50パーセンタイルを基準とする
 */
function buildRadarData(result: AnalysisResult): RadarDataItem[] {
  // benchmarkComparisonの順序:
  // エンゲージメント率, 保存率, シェア率, コメント率, フォロー転換率
  const dimensionLabels = [
    "エンゲージメント",
    "保存率",
    "シェア率",
    "コメント率",
    "フォロー転換",
  ];

  return result.benchmarkComparison.map((item, index) => ({
    dimension: dimensionLabels[index] ?? item.metric,
    user: Math.round(item.percentile),
    benchmark: 50, // ベンチマークは50パーセンタイル基準
  }));
}

/**
 * レーダーチャートの軸ラベルをカスタムレンダリング
 * ダークテーマ対応の白テキスト
 */
function renderPolarAngleAxisTick(props: Record<string, unknown>) {
  const payload = props.payload as { value: string } | undefined;
  const x = (props.x as number) ?? 0;
  const y = (props.y as number) ?? 0;

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fill="#d4d4d8"
      fontSize={11}
      fontWeight={500}
    >
      {payload?.value ?? ""}
    </text>
  );
}

/**
 * 投稿パフォーマンスレーダーチャート
 * 5つのパフォーマンス次元（エンゲージメント、保存率、シェア率、コメント率、フォロー転換）を
 * レーダーチャートで可視化する。ユーザーの実績値とベンチマークを重ねて比較表示する。
 */
export function RadarScore({ result }: RadarScoreProps) {
  const data = buildRadarData(result);

  return (
    <Card className="border-white/5 bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Hexagon className="h-4 w-4 text-pink-400" />
          パフォーマンスレーダー
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            {/* グリッド線 */}
            <PolarGrid
              stroke="rgba(255, 255, 255, 0.08)"
              strokeDasharray="3 3"
            />

            {/* 角度軸（次元名ラベル） */}
            <PolarAngleAxis
              dataKey="dimension"
              tick={renderPolarAngleAxisTick}
            />

            {/* 半径軸（0-100スケール） */}
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "#71717a", fontSize: 10 }}
              tickCount={5}
              axisLine={false}
            />

            {/* ベンチマーク（グレー、半透明） */}
            <Radar
              name="ベンチマーク"
              dataKey="benchmark"
              stroke="#71717a"
              strokeWidth={1.5}
              fill="#71717a"
              fillOpacity={0.15}
              dot={false}
            />

            {/* ユーザーの値（ピンク/パープルグラデーション） */}
            <Radar
              name="あなた"
              dataKey="user"
              stroke="url(#radarStrokeGradient)"
              strokeWidth={2}
              fill="url(#radarFillGradient)"
              fillOpacity={0.3}
              dot={{
                fill: "#ec4899",
                stroke: "#18181b",
                strokeWidth: 2,
                r: 4,
              }}
            />

            {/* グラデーション定義 */}
            <defs>
              <linearGradient id="radarFillGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <linearGradient id="radarStrokeGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>

            {/* 凡例 */}
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
              formatter={(value: string) => (
                <span className="text-zinc-300">{value}</span>
              )}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
