"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarPlus, Zap } from "lucide-react";
import type { Genre } from "@/lib/types";
import {
  generateWeeklyPlan,
  generateMonthlyPlan,
} from "@/engine/calendar/planner";
import { useCalendarStore } from "@/store/calendarStore";

/** ジャンル選択肢 */
const GENRE_OPTIONS: { value: Genre; label: string }[] = [
  { value: "fitness", label: "フィットネス" },
  { value: "food", label: "フード・料理" },
  { value: "travel", label: "旅行" },
  { value: "beauty", label: "美容" },
  { value: "business", label: "ビジネス" },
  { value: "lifestyle", label: "ライフスタイル" },
  { value: "tech", label: "テクノロジー" },
  { value: "education", label: "教育・学習" },
  { value: "fashion", label: "ファッション" },
  { value: "photography", label: "写真" },
];

/**
 * カレンダー生成コントロールコンポーネント
 * ジャンル、投稿頻度、開始日を選択して週間/月間プランを生成する
 */
export function CalendarGenerator() {
  const [genre, setGenre] = useState<string>("");
  const [postsPerWeek, setPostsPerWeek] = useState(5);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const { setEntries } = useCalendarStore();

  /** 週間プラン生成 */
  const handleGenerateWeekly = () => {
    if (!genre) return;
    const entries = generateWeeklyPlan(
      new Date(startDate),
      genre as Genre,
      postsPerWeek
    );
    setEntries(entries);
  };

  /** 月間プラン生成 */
  const handleGenerateMonthly = () => {
    if (!genre) return;
    const entries = generateMonthlyPlan(
      new Date(startDate),
      genre as Genre,
      postsPerWeek
    );
    setEntries(entries);
  };

  const isValid = genre !== "";

  return (
    <Card className="border-white/5 bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarPlus className="h-4 w-4 text-pink-400" />
          プラン設定
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {/* ジャンル選択 */}
          <div className="space-y-2">
            <Label>ジャンル</Label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger className="w-full bg-white/5 border-white/10">
                <SelectValue placeholder="ジャンルを選択" />
              </SelectTrigger>
              <SelectContent>
                {GENRE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 投稿頻度スライダー */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>週の投稿数</Label>
              <span className="rounded-md bg-white/10 px-2.5 py-0.5 text-sm font-bold tabular-nums">
                {postsPerWeek}回/週
              </span>
            </div>
            <Slider
              min={1}
              max={7}
              step={1}
              value={[postsPerWeek]}
              onValueChange={([v]) => setPostsPerWeek(v)}
              className="py-1"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/60 px-0.5">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
            </div>
          </div>

          {/* 開始日 */}
          <div className="space-y-2">
            <Label htmlFor="calendar-start-date">開始日</Label>
            <Input
              id="calendar-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white/5 border-white/10"
            />
          </div>

          {/* 生成ボタン */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              onClick={handleGenerateWeekly}
              disabled={!isValid}
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold hover:opacity-90 transition-opacity border-0"
            >
              <Zap className="mr-1.5 h-4 w-4" />
              週間プラン生成
            </Button>
            <Button
              onClick={handleGenerateMonthly}
              disabled={!isValid}
              variant="outline"
              className="border-white/10 hover:bg-white/5"
            >
              <CalendarPlus className="mr-1.5 h-4 w-4" />
              月間プラン生成
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
