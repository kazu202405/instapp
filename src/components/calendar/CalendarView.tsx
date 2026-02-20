"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  CalendarDays,
  Clock,
  Sparkles,
  Calendar as CalendarIcon,
  ListChecks,
  GripVertical,
} from "lucide-react";
import { useCalendarStore } from "@/store/calendarStore";
import { useCalendarDrag } from "@/hooks/useCalendarDrag";
import { formatDate } from "@/lib/utils";
import type { ContentPillar, PostFormat, HookType, CalendarEntry } from "@/lib/types";

/** ピラーの日本語ラベルと配色 */
const PILLAR_CONFIG: Record<
  ContentPillar,
  { label: string; bg: string; text: string; border: string }
> = {
  education: {
    label: "教育",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  inspiration: {
    label: "インスピレーション",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
  },
  connection: {
    label: "つながり",
    bg: "bg-pink-500/10",
    text: "text-pink-400",
    border: "border-pink-500/20",
  },
};

/** フォーマットの日本語ラベル */
const FORMAT_LABELS: Record<PostFormat, string> = {
  reel: "リール",
  carousel: "カルーセル",
  image: "画像",
  story: "ストーリーズ",
};

/** フック類型の日本語ラベル */
const HOOK_LABELS: Record<HookType, string> = {
  curiosity: "好奇心",
  controversy: "論争",
  story: "ストーリー",
  number: "数字",
  question: "質問",
  shock: "驚き",
};

/** ステータスの日本語ラベルと配色 */
const STATUS_CONFIG: Record<
  CalendarEntry["status"],
  { label: string; className: string }
> = {
  planned: { label: "計画済み", className: "bg-muted/50 text-muted-foreground border-border/50" },
  drafted: { label: "下書き", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  posted: { label: "投稿済み", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
};

/** 曜日ラベル */
const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

/**
 * 日付ごとにエントリをグループ化するユーティリティ
 */
function groupByDate(entries: CalendarEntry[]): Map<string, CalendarEntry[]> {
  const map = new Map<string, CalendarEntry[]>();
  for (const entry of entries) {
    const group = map.get(entry.date) ?? [];
    group.push(entry);
    map.set(entry.date, group);
  }
  return map;
}

/**
 * 曜日の色クラスを取得
 */
function getDayColor(dateStr: string): string {
  const day = new Date(dateStr).getDay();
  if (day === 0) return "text-red-400";
  if (day === 6) return "text-blue-400";
  return "text-foreground";
}

/**
 * ドラッグ&ドロップ対応のカレンダーエントリカード
 */
function EntryCard({
  entry,
  isDragging,
  onDragStart,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: {
  entry: CalendarEntry;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent<HTMLElement>, entryId: string) => void;
  onDragEnd: (e: React.DragEvent<HTMLElement>) => void;
  onTouchStart: (entryId: string, e: React.TouchEvent<HTMLElement>) => void;
  onTouchMove: (e: React.TouchEvent<HTMLElement>) => void;
  onTouchEnd: () => void;
}) {
  const pillar = PILLAR_CONFIG[entry.pillar];
  const status = STATUS_CONFIG[entry.status];

  // キャプション生成ページへのリンクパラメータ（from=calendarで遷移元を識別）
  const captionParams = new URLSearchParams({
    theme: entry.theme,
    hookType: entry.hookType,
    pillar: entry.pillar,
    format: entry.format,
    from: "calendar",
  });

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, entry.id)}
      onDragEnd={onDragEnd}
      onTouchStart={(e) => onTouchStart(entry.id, e)}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`group rounded-xl bg-white/5 p-4 transition-all hover:bg-white/[0.07] cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50 ring-2 ring-purple-500" : ""
      }`}
      role="listitem"
      aria-grabbed={isDragging}
      aria-label={`${entry.theme} - ${formatDate(entry.date, "M/d")} ${entry.time}`}
    >
      <div className="flex flex-wrap items-start gap-2">
        {/* ドラッグハンドルアイコン */}
        <GripVertical className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-0.5 touch-none" aria-hidden="true" />

        {/* 時間 */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span className="tabular-nums font-medium">{entry.time}</span>
        </div>

        {/* ピラーバッジ */}
        <Badge
          variant="outline"
          className={`text-xs border ${pillar.bg} ${pillar.text} ${pillar.border}`}
        >
          {pillar.label}
        </Badge>

        {/* フォーマットバッジ */}
        <Badge variant="secondary" className="text-xs">
          {FORMAT_LABELS[entry.format]}
        </Badge>

        {/* ステータスバッジ */}
        <Badge
          variant="outline"
          className={`text-xs border ml-auto ${status.className}`}
        >
          {status.label}
        </Badge>
      </div>

      {/* テーマ */}
      <p className="mt-2.5 text-sm font-medium leading-relaxed">
        {entry.theme}
      </p>

      {/* フック類型 */}
      <p className="mt-1 text-xs text-muted-foreground">
        フック: {HOOK_LABELS[entry.hookType]}型
      </p>

      {/* キャプション生成ボタン */}
      <div className="mt-3 flex justify-end">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
        >
          <Link href={`/caption?${captionParams.toString()}`}>
            <Sparkles className="mr-1 h-3 w-3" />
            キャプション生成
          </Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * 週表示: 日付ごとにエントリを縦一覧で表示（ドラッグ&ドロップ対応）
 */
function WeekView({
  entries,
  dragItemId,
  dropTargetDate,
  flashDate,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: {
  entries: CalendarEntry[];
  dragItemId: string | null;
  dropTargetDate: string | null;
  flashDate: string | null;
  onDragStart: (e: React.DragEvent<HTMLElement>, entryId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLElement>, date: string) => void;
  onDragLeave: (e: React.DragEvent<HTMLElement>) => void;
  onDrop: (e: React.DragEvent<HTMLElement>, targetDate: string) => void;
  onDragEnd: (e: React.DragEvent<HTMLElement>) => void;
  onTouchStart: (entryId: string, e: React.TouchEvent<HTMLElement>) => void;
  onTouchMove: (e: React.TouchEvent<HTMLElement>) => void;
  onTouchEnd: () => void;
}) {
  const grouped = useMemo(() => groupByDate(entries), [entries]);

  // 日付を昇順ソート
  const sortedDates = Array.from(grouped.keys()).sort();

  // 最初の7日分のみ表示
  const weekDates = sortedDates.slice(0, 7);

  if (weekDates.length === 0) {
    return (
      <EmptyState message="週間プランがまだありません。上の設定からプランを生成してください。" />
    );
  }

  return (
    <div className="space-y-4" role="list" aria-label="週間投稿プラン">
      {weekDates.map((date) => {
        const dayEntries = grouped.get(date) ?? [];
        const dayOfWeek = new Date(date).getDay();
        const isDropTarget = dropTargetDate === date && dragItemId !== null;
        const isFlashing = flashDate === date;

        return (
          <div
            key={date}
            data-date={date}
            onDragOver={(e) => onDragOver(e, date)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, date)}
            className={`rounded-xl p-2 transition-all duration-200 ${
              isDropTarget
                ? "bg-purple-500/10 border-2 border-dashed border-purple-500"
                : "border-2 border-transparent"
            } ${
              isFlashing ? "animate-pulse bg-purple-500/15" : ""
            }`}
          >
            {/* 日付ヘッダー */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`flex items-center gap-1.5 text-sm font-semibold ${getDayColor(
                  date
                )}`}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                {formatDate(date, "M/d")}
                <span className="text-xs">({DAY_LABELS[dayOfWeek]})</span>
              </div>
              <div className="flex-1 h-px bg-white/5" />
              {isDropTarget && (
                <span className="text-xs text-purple-400 animate-pulse">
                  ここにドロップ
                </span>
              )}
            </div>

            {/* エントリ一覧 */}
            <div className="space-y-2 pl-1">
              {dayEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  isDragging={dragItemId === entry.id}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * 月表示: 全日付のエントリを表示（ドラッグ&ドロップ対応）
 */
function MonthView({
  entries,
  dragItemId,
  dropTargetDate,
  flashDate,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: {
  entries: CalendarEntry[];
  dragItemId: string | null;
  dropTargetDate: string | null;
  flashDate: string | null;
  onDragStart: (e: React.DragEvent<HTMLElement>, entryId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLElement>, date: string) => void;
  onDragLeave: (e: React.DragEvent<HTMLElement>) => void;
  onDrop: (e: React.DragEvent<HTMLElement>, targetDate: string) => void;
  onDragEnd: (e: React.DragEvent<HTMLElement>) => void;
  onTouchStart: (entryId: string, e: React.TouchEvent<HTMLElement>) => void;
  onTouchMove: (e: React.TouchEvent<HTMLElement>) => void;
  onTouchEnd: () => void;
}) {
  const grouped = useMemo(() => groupByDate(entries), [entries]);
  const sortedDates = Array.from(grouped.keys()).sort();

  if (sortedDates.length === 0) {
    return (
      <EmptyState message="月間プランがまだありません。上の設定からプランを生成してください。" />
    );
  }

  // 週ごとにグループ化して表示
  const weeks: string[][] = [];
  let currentWeek: string[] = [];

  for (const date of sortedDates) {
    const dayOfWeek = new Date(date).getDay();
    // 月曜(1)を週の始まりとする - 月曜が来たら新しい週を開始
    if (dayOfWeek === 1 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(date);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div className="space-y-6" role="list" aria-label="月間投稿プラン">
      {weeks.map((weekDates, weekIndex) => (
        <div key={weekIndex}>
          {/* 週ヘッダー */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">
              第{weekIndex + 1}週
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDate(weekDates[0], "M/d")} - {formatDate(weekDates[weekDates.length - 1], "M/d")}
            </span>
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-muted-foreground">
              {weekDates.reduce(
                (acc, d) => acc + (grouped.get(d)?.length ?? 0),
                0
              )}
              投稿
            </span>
          </div>

          {/* 各日のエントリ */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {weekDates.map((date) => {
              const dayEntries = grouped.get(date) ?? [];
              const dayOfWeek = new Date(date).getDay();
              const isDropTarget = dropTargetDate === date && dragItemId !== null;
              const isFlashing = flashDate === date;

              return (
                <div
                  key={date}
                  data-date={date}
                  onDragOver={(e) => onDragOver(e, date)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, date)}
                  className={`rounded-xl border p-3 transition-all duration-200 ${
                    isDropTarget
                      ? "bg-purple-500/10 border-dashed border-purple-500"
                      : "border-white/5 bg-white/[0.02]"
                  } ${
                    isFlashing ? "animate-pulse bg-purple-500/15" : ""
                  }`}
                >
                  {/* 日付ラベル */}
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`text-xs font-semibold ${getDayColor(date)}`}
                    >
                      {formatDate(date, "M/d")} ({DAY_LABELS[dayOfWeek]})
                    </div>
                    {isDropTarget && (
                      <span className="text-[10px] text-purple-400 animate-pulse">
                        ドロップ
                      </span>
                    )}
                  </div>

                  {/* エントリ */}
                  <div className="space-y-2">
                    {dayEntries.map((entry) => {
                      const pillar = PILLAR_CONFIG[entry.pillar];
                      const isDragging = dragItemId === entry.id;

                      return (
                        <div
                          key={entry.id}
                          draggable
                          onDragStart={(e) => onDragStart(e, entry.id)}
                          onDragEnd={onDragEnd}
                          onTouchStart={(e) => onTouchStart(entry.id, e)}
                          onTouchMove={onTouchMove}
                          onTouchEnd={onTouchEnd}
                          className={`rounded-lg p-2.5 cursor-grab active:cursor-grabbing transition-all ${pillar.bg} ${
                            isDragging ? "opacity-50 ring-2 ring-purple-500" : ""
                          }`}
                          role="listitem"
                          aria-grabbed={isDragging}
                          aria-label={`${entry.theme} - ${formatDate(entry.date, "M/d")} ${entry.time}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <GripVertical className="h-3 w-3 text-muted-foreground/60 shrink-0 touch-none" aria-hidden="true" />
                            <span className="text-[10px] text-muted-foreground tabular-nums">
                              {entry.time}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 border ${pillar.text} ${pillar.border}`}
                            >
                              {pillar.label}
                            </Badge>
                          </div>
                          <p className="text-xs font-medium leading-relaxed truncate">
                            {entry.theme}
                          </p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-muted-foreground">
                              {FORMAT_LABELS[entry.format]}
                            </span>
                            <Button
                              asChild
                              variant="ghost"
                              size="xs"
                              className="text-[10px] text-pink-400 hover:text-pink-300 h-5 px-1.5"
                            >
                              <Link
                                href={`/caption?theme=${encodeURIComponent(entry.theme)}&hookType=${entry.hookType}&pillar=${entry.pillar}&format=${entry.format}&from=calendar`}
                              >
                                <Sparkles className="mr-0.5 h-2.5 w-2.5" />
                                生成
                              </Link>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * エントリが存在しない場合の空状態表示
 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
      <CalendarDays className="h-12 w-12 text-muted-foreground/30 mb-4" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

/**
 * カレンダー表示コンポーネント
 * 週/月タブ切り替えでエントリを可視化する
 * ドラッグ&ドロップでエントリの日付を変更可能
 */
export function CalendarView() {
  const { entries, viewMode, setViewMode } = useCalendarStore();
  const drag = useCalendarDrag();

  // 統計情報
  const pillarCounts = useMemo(() => {
    const counts: Record<ContentPillar, number> = {
      education: 0,
      inspiration: 0,
      connection: 0,
    };
    for (const entry of entries) {
      counts[entry.pillar]++;
    }
    return counts;
  }, [entries]);

  // ドラッグ&ドロップのpropsをまとめる
  const dragProps = {
    dragItemId: drag.dragItemId,
    dropTargetDate: drag.dropTargetDate,
    flashDate: drag.flashDate,
    onDragStart: drag.onDragStart,
    onDragOver: drag.onDragOver,
    onDragLeave: drag.onDragLeave,
    onDrop: drag.onDrop,
    onDragEnd: drag.onDragEnd,
    onTouchStart: drag.onTouchStart,
    onTouchMove: drag.onTouchMove,
    onTouchEnd: drag.onTouchEnd,
  };

  return (
    <Card className="border-white/5 bg-white/[0.03]">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="h-4 w-4 text-muted-foreground" />
            投稿プラン
            {entries.length > 0 && (
              <Badge variant="secondary" className="text-xs ml-1">
                {entries.length}件
              </Badge>
            )}
          </CardTitle>

          {/* ピラー分布バッジ */}
          {entries.length > 0 && (
            <div className="flex items-center gap-2">
              {(Object.entries(pillarCounts) as [ContentPillar, number][])
                .filter(([, count]) => count > 0)
                .map(([pillar, count]) => {
                  const config = PILLAR_CONFIG[pillar];
                  return (
                    <span
                      key={pillar}
                      className={`text-[10px] px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}
                    >
                      {config.label} {count}
                    </span>
                  );
                })}
            </div>
          )}
        </div>

        {/* ドラッグ&ドロップ操作ヒント */}
        {entries.length > 0 && (
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            カードをドラッグして別の日付に移動できます（モバイル: 長押しで開始）
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as "week" | "month")}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="week">週間表示</TabsTrigger>
            <TabsTrigger value="month">月間表示</TabsTrigger>
          </TabsList>
          <TabsContent value="week">
            <WeekView entries={entries} {...dragProps} />
          </TabsContent>
          <TabsContent value="month">
            <MonthView entries={entries} {...dragProps} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
