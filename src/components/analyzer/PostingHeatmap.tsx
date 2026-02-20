"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock } from "lucide-react";

/**
 * エンゲージメントレベル定義
 * 日本のInstagramユーザーの行動パターンに基づく最適投稿時間
 */
type EngagementLevel = "low" | "medium" | "good" | "best";

/**
 * 曜日ラベル（日本語）
 * 0=月曜日 〜 6=日曜日
 */
const DAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"] as const;

/**
 * X軸に表示する時間ラベル（3時間刻み）
 */
const HOUR_LABELS = [0, 3, 6, 9, 12, 15, 18, 21] as const;

/**
 * ツールチップの状態
 */
interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  day: string;
  hour: number;
  level: EngagementLevel;
}

/**
 * 各エンゲージメントレベルに対応する背景色クラス
 */
const LEVEL_COLORS: Record<EngagementLevel, string> = {
  low: "bg-white/[0.03]",
  medium: "bg-purple-500/20",
  good: "bg-purple-500/40",
  best: "bg-gradient-to-br from-pink-500/60 to-purple-500/60",
};

/**
 * 各エンゲージメントレベルの日本語名
 */
const LEVEL_LABELS: Record<EngagementLevel, string> = {
  low: "低い",
  medium: "普通",
  good: "高い",
  best: "最適",
};

/**
 * 時間帯と曜日からエンゲージメントレベルを判定する
 * 日本のInstagramユーザーの行動パターンに基づくデータ
 *
 * 平日のベストタイム: 7-9時、12-13時、19-21時
 * 平日のグッドタイム: 6時、10-11時、14-15時、18時、22時
 * 週末のベストタイム: 10-12時、15-17時、20-22時
 * 週末のグッドタイム: 9時、13-14時、18-19時、23時
 */
function getEngagementLevel(dayIndex: number, hour: number): EngagementLevel {
  const isWeekend = dayIndex >= 5; // 土日

  if (isWeekend) {
    // 週末パターン
    if (
      (hour >= 10 && hour <= 12) ||
      (hour >= 15 && hour <= 17) ||
      (hour >= 20 && hour <= 22)
    ) {
      return "best";
    }
    if (
      hour === 9 ||
      hour === 13 ||
      hour === 14 ||
      hour === 18 ||
      hour === 19 ||
      hour === 23
    ) {
      return "good";
    }
    if (hour >= 8 && hour <= 23) {
      return "medium";
    }
    return "low";
  }

  // 平日パターン
  if (
    (hour >= 7 && hour <= 9) ||
    (hour >= 12 && hour <= 13) ||
    (hour >= 19 && hour <= 21)
  ) {
    return "best";
  }
  if (
    hour === 6 ||
    hour === 10 ||
    hour === 11 ||
    hour === 14 ||
    hour === 15 ||
    hour === 18 ||
    hour === 22
  ) {
    return "good";
  }
  if (hour >= 6 && hour <= 23) {
    return "medium";
  }
  return "low";
}

/**
 * 投稿時間ヒートマップコンポーネント
 * 7日x24時間のグリッドで最適な投稿時間帯を色分け表示する。
 * 日本のInstagramユーザーの行動パターンに基づくデータを使用。
 */
export function PostingHeatmap() {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    day: "",
    hour: 0,
    level: "low",
  });

  /**
   * セルホバー時にツールチップを表示
   */
  const handleCellHover = useCallback(
    (
      event: React.MouseEvent<HTMLDivElement>,
      dayIndex: number,
      hour: number,
    ) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const parentRect =
        event.currentTarget.closest("[data-heatmap]")?.getBoundingClientRect();
      if (!parentRect) return;

      setTooltip({
        visible: true,
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top - 8,
        day: DAY_LABELS[dayIndex],
        hour,
        level: getEngagementLevel(dayIndex, hour),
      });
    },
    [],
  );

  /**
   * ツールチップを非表示にする
   */
  const handleCellLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <Card className="border-white/5 bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-pink-400" />
          最適投稿時間
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">
          日本のInstagramユーザーの行動パターンに基づく投稿時間帯の推奨度
        </p>

        {/* ヒートマップ本体 */}
        <div className="relative" data-heatmap>
          {/* ツールチップ */}
          {tooltip.visible && (
            <div
              className="absolute z-10 pointer-events-none rounded-lg border border-border bg-card/95 dark:bg-zinc-900/95 px-3 py-2 shadow-xl -translate-x-1/2 -translate-y-full"
              style={{ left: tooltip.x, top: tooltip.y }}
              role="tooltip"
            >
              <p className="text-xs font-medium text-white">
                {tooltip.day}曜日 {tooltip.hour}:00
              </p>
              <p className="text-xs text-muted-foreground">
                エンゲージメント:{" "}
                <span
                  className={
                    tooltip.level === "best"
                      ? "text-pink-400 font-semibold"
                      : tooltip.level === "good"
                        ? "text-purple-400 font-semibold"
                        : "text-muted-foreground"
                  }
                >
                  {LEVEL_LABELS[tooltip.level]}
                </span>
              </p>
            </div>
          )}

          {/* グリッドレイアウト */}
          <div className="flex gap-1">
            {/* 曜日ラベル列 */}
            <div className="flex flex-col gap-1 shrink-0 pr-1">
              {/* 時間ラベル行分のスペーサー */}
              <div className="h-4" />
              {DAY_LABELS.map((day) => (
                <div
                  key={day}
                  className="flex h-6 w-6 items-center justify-center text-[10px] text-muted-foreground font-medium"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* ヒートマップセル */}
            <div className="flex-1 min-w-0 overflow-x-auto">
              {/* 時間ラベル行 */}
              <div
                className="grid gap-1 mb-1"
                style={{
                  gridTemplateColumns: "repeat(24, minmax(0, 1fr))",
                }}
              >
                {Array.from({ length: 24 }, (_, hour) => (
                  <div
                    key={hour}
                    className="flex h-4 items-center justify-center text-[9px] text-muted-foreground"
                  >
                    {HOUR_LABELS.includes(hour as (typeof HOUR_LABELS)[number])
                      ? hour
                      : ""}
                  </div>
                ))}
              </div>

              {/* 各曜日のセル行 */}
              {DAY_LABELS.map((_, dayIndex) => (
                <div
                  key={dayIndex}
                  className="grid gap-1 mb-1"
                  style={{
                    gridTemplateColumns: "repeat(24, minmax(0, 1fr))",
                  }}
                >
                  {Array.from({ length: 24 }, (_, hour) => {
                    const level = getEngagementLevel(dayIndex, hour);
                    return (
                      <div
                        key={hour}
                        className={`h-6 rounded-sm cursor-pointer transition-all duration-150 hover:ring-1 hover:ring-white/30 hover:scale-110 ${LEVEL_COLORS[level]}`}
                        onMouseEnter={(e) =>
                          handleCellHover(e, dayIndex, hour)
                        }
                        onMouseLeave={handleCellLeave}
                        aria-label={`${DAY_LABELS[dayIndex]}曜日 ${hour}時 - ${LEVEL_LABELS[level]}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* 凡例 */}
          <div className="flex items-center justify-end gap-3 mt-4">
            <span className="text-[10px] text-muted-foreground">低い</span>
            <div className="flex gap-1">
              {(["low", "medium", "good", "best"] as const).map((level) => (
                <div
                  key={level}
                  className={`h-3 w-6 rounded-sm ${LEVEL_COLORS[level]}`}
                  aria-label={LEVEL_LABELS[level]}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">最適</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
