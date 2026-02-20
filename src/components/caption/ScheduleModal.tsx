"use client";

import { useState } from "react";
import { CalendarPlus, Clock } from "lucide-react";
import { toast } from "sonner";
import { useCalendarStore } from "@/store/calendarStore";
import { cn } from "@/lib/utils";
import type { ContentPillar, PostFormat, HookType } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ScheduleModalProps {
  /** キャプションのフック行（説明として使用） */
  hookLine: string;
  /** キャプションのテーマ */
  theme: string;
  /** ジャンル */
  genre: string;
  /** フックタイプ */
  hookType: HookType;
  /** トリガーボタンのカスタムクラス */
  className?: string;
}

// ピラー選択肢
const pillarOptions: {
  value: ContentPillar;
  label: string;
  color: string;
}[] = [
  {
    value: "education",
    label: "教育",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  {
    value: "inspiration",
    label: "インスピレーション",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  {
    value: "connection",
    label: "つながり",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
  },
];

// フォーマット選択肢
const formatOptions: { value: PostFormat; label: string }[] = [
  { value: "image", label: "画像" },
  { value: "carousel", label: "カルーセル" },
  { value: "reel", label: "リール" },
];

/**
 * キャプションをカレンダーにスケジュールするモーダル
 * 日付・時間・ピラー・フォーマットを選択して予約できる
 */
export function ScheduleModal({
  hookLine,
  theme,
  genre,
  hookType,
  className,
}: ScheduleModalProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => {
    // デフォルト: 明日の日付
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [time, setTime] = useState("19:00");
  const [pillar, setPillar] = useState<ContentPillar>("education");
  const [format, setFormat] = useState<PostFormat>("image");

  const { addEntry } = useCalendarStore();

  // 日付バリデーション: 過去の日付を許可しない
  const isDateValid = (() => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(date + "T00:00:00");
    return selected >= today;
  })();

  // 時間バリデーション: フォーマットが正しいか
  const isTimeValid = /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

  const canSubmit = isDateValid && isTimeValid;

  const handleSchedule = () => {
    if (!canSubmit) {
      toast.error("日付と時間を正しく入力してください");
      return;
    }

    const entry = {
      id: `cal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date,
      time,
      theme: theme || hookLine,
      pillar,
      format,
      hookType,
      status: "planned" as const,
    };

    addEntry(entry);
    toast.success("カレンダーに予約しました");
    setOpen(false);
  };

  // 表示用テーマテキスト（長い場合は省略）
  const displayTheme = (theme || hookLine).length > 30
    ? (theme || hookLine).slice(0, 30) + "..."
    : (theme || hookLine);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
            "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300",
            "hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-200",
            "border border-purple-500/20 hover:border-purple-500/40",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
            className
          )}
          aria-label="カレンダーに予約する"
        >
          <CalendarPlus className="size-3.5" aria-hidden="true" />
          カレンダーに予約
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">投稿をスケジュール</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            「{displayTheme}」をカレンダーに追加します
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 日付 */}
          <div className="space-y-1.5">
            <label
              htmlFor="schedule-date"
              className="text-sm font-medium text-foreground"
            >
              投稿日
            </label>
            <input
              id="schedule-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm",
                "bg-card text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-purple-500/50",
                !isDateValid && date
                  ? "border-red-500/50"
                  : "border-border"
              )}
            />
            {!isDateValid && date && (
              <p className="text-xs text-red-400">過去の日付は選択できません</p>
            )}
          </div>

          {/* 時間 */}
          <div className="space-y-1.5">
            <label
              htmlFor="schedule-time"
              className="text-sm font-medium text-foreground flex items-center gap-1.5"
            >
              <Clock className="size-3.5 text-muted-foreground" aria-hidden="true" />
              投稿時間
            </label>
            <input
              id="schedule-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm",
                "bg-card text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-purple-500/50",
                !isTimeValid && time
                  ? "border-red-500/50"
                  : "border-border"
              )}
            />
          </div>

          {/* ピラー */}
          <fieldset className="space-y-1.5">
            <legend className="text-sm font-medium text-foreground">
              コンテンツピラー
            </legend>
            <div className="flex gap-2">
              {pillarOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPillar(opt.value)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
                    pillar === opt.value
                      ? opt.color
                      : "border-border text-muted-foreground hover:bg-muted/40"
                  )}
                  aria-pressed={pillar === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* フォーマット */}
          <fieldset className="space-y-1.5">
            <legend className="text-sm font-medium text-foreground">
              フォーマット
            </legend>
            <div className="flex gap-2">
              {formatOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormat(opt.value)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
                    format === opt.value
                      ? "border-pink-500/30 bg-pink-500/20 text-pink-400"
                      : "border-border text-muted-foreground hover:bg-muted/40"
                  )}
                  aria-pressed={format === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {/* アクションボタン */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSchedule}
            disabled={!canSubmit}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium text-white transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
              canSubmit
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            予約する
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
