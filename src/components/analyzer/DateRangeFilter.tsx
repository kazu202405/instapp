"use client";

import { useState, useCallback, useMemo } from "react";
import { subDays, format } from "date-fns";
import { CalendarDays } from "lucide-react";

/**
 * プリセット範囲の定義
 */
interface PresetOption {
  label: string;
  days: number | null; // nullは全期間
}

const PRESETS: PresetOption[] = [
  { label: "直近7日", days: 7 },
  { label: "直近30日", days: 30 },
  { label: "直近90日", days: 90 },
  { label: "全期間", days: null },
];

/**
 * 日付範囲フィルターのProps
 */
interface DateRangeFilterProps {
  /** 範囲変更時のコールバック（ISO日付文字列、null=制限なし） */
  onRangeChange: (startDate: string | null, endDate: string | null) => void;
  /** フィルター前の総件数 */
  totalCount: number;
  /** フィルター後の件数 */
  filteredCount: number;
  /** コンパクト版（プリセットのみ表示） */
  compact?: boolean;
}

/**
 * 日付範囲フィルターUIコンポーネント
 * プリセットボタンとカスタム日付ピッカーを提供する
 */
export function DateRangeFilter({
  onRangeChange,
  totalCount,
  filteredCount,
  compact = false,
}: DateRangeFilterProps) {
  // 選択中のプリセット（nullはカスタム範囲を示す）
  const [activePreset, setActivePreset] = useState<number | null>(null);
  // カスタム日付範囲
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  /** 今日の日付をISO形式で取得 */
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  /** プリセットボタンクリック時の処理 */
  const handlePresetClick = useCallback(
    (preset: PresetOption) => {
      setActivePreset(preset.days);
      // カスタム日付入力をリセット
      setCustomStart("");
      setCustomEnd("");

      if (preset.days === null) {
        // 全期間
        onRangeChange(null, null);
      } else {
        const start = format(subDays(new Date(), preset.days), "yyyy-MM-dd");
        onRangeChange(start, today);
      }
    },
    [onRangeChange, today],
  );

  /** カスタム開始日の変更 */
  const handleCustomStartChange = useCallback(
    (value: string) => {
      setCustomStart(value);
      setActivePreset(-1); // カスタムモードを示す
      onRangeChange(value || null, customEnd || null);
    },
    [onRangeChange, customEnd],
  );

  /** カスタム終了日の変更 */
  const handleCustomEndChange = useCallback(
    (value: string) => {
      setCustomEnd(value);
      setActivePreset(-1); // カスタムモードを示す
      onRangeChange(customStart || null, value || null);
    },
    [onRangeChange, customStart],
  );

  /** 現在のフィルター状態のラベルを生成 */
  const filterLabel = useMemo(() => {
    if (activePreset === null) return "";
    if (activePreset === -1) return "カスタム範囲";
    const preset = PRESETS.find((p) => p.days === activePreset);
    return preset?.label ?? "";
  }, [activePreset]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* フィルターアイコン */}
      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />

      {/* プリセットボタン */}
      <div
        className="flex items-center gap-1.5"
        role="group"
        aria-label="日付範囲プリセット"
      >
        {PRESETS.map((preset) => {
          const isActive = activePreset === preset.days;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-150 border ${
                isActive
                  ? "bg-purple-600/20 text-purple-300 border-purple-500/30"
                  : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
              }`}
              aria-pressed={isActive}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* カスタム日付入力（コンパクト版では非表示） */}
      {!compact && (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={customStart}
            max={customEnd || today}
            onChange={(e) => handleCustomStartChange(e.target.value)}
            className="h-7 rounded-md border border-border bg-muted px-2 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            aria-label="開始日"
          />
          <span className="text-muted-foreground text-[11px]">-</span>
          <input
            type="date"
            value={customEnd}
            min={customStart}
            max={today}
            onChange={(e) => handleCustomEndChange(e.target.value)}
            className="h-7 rounded-md border border-border bg-muted px-2 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            aria-label="終了日"
          />
        </div>
      )}

      {/* フィルター結果カウント */}
      {activePreset !== null && (
        <span className="text-muted-foreground text-xs ml-auto">
          {filterLabel} ({filteredCount}件/{totalCount}件)
        </span>
      )}
    </div>
  );
}
