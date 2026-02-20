"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, CalendarCheck } from "lucide-react";

/**
 * チャートデータ型
 */
interface GrowthDataPoint {
  month: string;
  conservative: number;
  expected: number;
  optimistic: number;
}

/**
 * カスタムツールチップ
 * 3つのシナリオの予測フォロワー数を表示する
 */
function GrowthTooltip({
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
    <div className="rounded-lg border border-border bg-card/95 px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-white mb-1.5">{label}</p>
      {payload.map((entry, index) => (
        <p
          key={index}
          className="text-xs"
          style={{ color: entry.color }}
        >
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

/**
 * 目標達成予測日を算出する
 * 週あたりの増加数から目標フォロワー数に到達するまでの日数を計算
 * @param currentFollowers - 現在のフォロワー数
 * @param weeklyGrowth - 週あたりの増加数
 * @param goal - 目標フォロワー数
 * @returns 予測日の文字列表現（到達不可能な場合はnull）
 */
function calculateGoalDate(
  currentFollowers: number,
  weeklyGrowth: number,
  goal: number,
): string | null {
  if (weeklyGrowth <= 0 || goal <= currentFollowers) return null;

  const remaining = goal - currentFollowers;
  const weeksNeeded = Math.ceil(remaining / weeklyGrowth);
  const daysNeeded = weeksNeeded * 7;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysNeeded);

  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();

  return `${year}年${month}月${day}日`;
}

/**
 * 12ヶ月分の成長予測データを生成する
 * 複利的な成長モデルを使用（月ごとに前月の値に対して一定比率で増加）
 * @param currentFollowers - 現在のフォロワー数
 * @param weeklyGrowth - 週あたりの増加数
 * @returns 12ヶ月分のGrowthDataPoint配列
 */
function generateGrowthData(
  currentFollowers: number,
  weeklyGrowth: number,
): GrowthDataPoint[] {
  const data: GrowthDataPoint[] = [];
  const monthlyGrowth = weeklyGrowth * 4.33; // 平均4.33週/月

  // 月ごとの成長率を算出（複利成長）
  const monthlyRate = currentFollowers > 0
    ? monthlyGrowth / currentFollowers
    : 0;

  // 3つのシナリオ用の成長率
  const conservativeRate = monthlyRate * 0.8;  // -20%
  const expectedRate = monthlyRate;
  const optimisticRate = monthlyRate * 1.3;    // +30%

  let conservative = currentFollowers;
  let expected = currentFollowers;
  let optimistic = currentFollowers;

  const now = new Date();

  for (let i = 0; i <= 12; i++) {
    const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthLabel = `${futureDate.getMonth() + 1}月`;

    data.push({
      month: i === 0 ? "現在" : monthLabel,
      conservative: Math.round(conservative),
      expected: Math.round(expected),
      optimistic: Math.round(optimistic),
    });

    // 複利で次月の値を算出
    conservative += conservative * conservativeRate;
    expected += expected * expectedRate;
    optimistic += optimistic * optimisticRate;
  }

  return data;
}

/**
 * フォロワー成長シミュレーター
 * 現在のフォロワー数と週あたりの増加数から12ヶ月間の成長を予測する。
 * 保守的、期待値、楽観的の3シナリオをエリアチャートで可視化。
 */
export function GrowthSimulator() {
  // チャート表示準備状態の管理（スケルトン→チャートへの遷移）
  const [isChartReady, setIsChartReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsChartReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const [currentFollowers, setCurrentFollowers] = useState<number>(1000);
  const [weeklyGrowth, setWeeklyGrowth] = useState<number>(50);
  const [goal, setGoal] = useState<number>(10000);

  /**
   * 入力値変更ハンドラ（負の値を防止）
   */
  const handleFollowersChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Math.max(0, Number(e.target.value) || 0);
      setCurrentFollowers(value);
    },
    [],
  );

  const handleWeeklyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Math.max(0, Number(e.target.value) || 0);
      setWeeklyGrowth(value);
    },
    [],
  );

  const handleGoalChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Math.max(0, Number(e.target.value) || 0);
      setGoal(value);
    },
    [],
  );

  // チャートデータを生成
  const chartData = useMemo(
    () => generateGrowthData(currentFollowers, weeklyGrowth),
    [currentFollowers, weeklyGrowth],
  );

  // 目標達成予測日
  const goalDate = useMemo(
    () => calculateGoalDate(currentFollowers, weeklyGrowth, goal),
    [currentFollowers, weeklyGrowth, goal],
  );

  return (
    <div className="space-y-5">
      {/* 入力フィールド */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label
            htmlFor="current-followers"
            className="text-xs text-muted-foreground"
          >
            現在のフォロワー数
          </Label>
          <Input
            id="current-followers"
            type="number"
            min={0}
            value={currentFollowers}
            onChange={handleFollowersChange}
            className="bg-white/5 border-white/10 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="weekly-growth"
            className="text-xs text-muted-foreground"
          >
            週あたり増加数
          </Label>
          <Input
            id="weekly-growth"
            type="number"
            min={0}
            value={weeklyGrowth}
            onChange={handleWeeklyChange}
            className="bg-white/5 border-white/10 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="goal" className="text-xs text-muted-foreground">
            目標フォロワー数
          </Label>
          <Input
            id="goal"
            type="number"
            min={0}
            value={goal}
            onChange={handleGoalChange}
            className="bg-white/5 border-white/10 text-sm"
          />
        </div>
      </div>

      {/* 目標達成予測日 */}
      {goalDate && (
        <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 px-4 py-3">
          <CalendarCheck className="h-4 w-4 text-pink-400 shrink-0" />
          <p className="text-sm text-muted-foreground">
            <span className="text-muted-foreground">目標達成予測日: </span>
            <span className="font-semibold text-pink-400">{goalDate}</span>
            <span className="text-muted-foreground text-xs ml-2">
              （期待値ベース）
            </span>
          </p>
        </div>
      )}
      {goal > 0 && goal <= currentFollowers && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
          <Target className="h-4 w-4 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-400 font-medium">
            目標を達成済みです
          </p>
        </div>
      )}

      {/* 成長予測チャート */}
      {!isChartReady ? (
        <div className="h-[300px] space-y-3 p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-4 w-48" />
        </div>
      ) : (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255, 255, 255, 0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={50}
            tickFormatter={(value: number) =>
              value >= 1000 ? `${(value / 1000).toFixed(1)}K` : String(value)
            }
          />
          <Tooltip content={<GrowthTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
          />

          {/* グラデーション定義 */}
          <defs>
            <linearGradient id="gradConservative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#71717a" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#71717a" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradExpected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradOptimistic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {/* 保守的シナリオ */}
          <Area
            type="monotone"
            dataKey="conservative"
            name="保守的 (-20%)"
            stroke="#71717a"
            strokeWidth={1.5}
            fill="url(#gradConservative)"
            dot={false}
          />

          {/* 期待値シナリオ */}
          <Area
            type="monotone"
            dataKey="expected"
            name="期待値"
            stroke="#a855f7"
            strokeWidth={2}
            fill="url(#gradExpected)"
            dot={false}
          />

          {/* 楽観的シナリオ */}
          <Area
            type="monotone"
            dataKey="optimistic"
            name="楽観的 (+30%)"
            stroke="#ec4899"
            strokeWidth={1.5}
            fill="url(#gradOptimistic)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}
