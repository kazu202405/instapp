"use client";

import { CalendarDays } from "lucide-react";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { CalendarGenerator } from "@/components/calendar/CalendarGenerator";
import { CalendarView } from "@/components/calendar/CalendarView";

/**
 * コンテンツカレンダーページ
 * ジャンル・頻度・開始日を指定して戦略的な投稿計画を自動生成する
 */
export default function CalendarPage() {
  return (
    <AnimatedPage>
    <div className="space-y-8">
      {/* ページヘッダー */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
            <CalendarDays className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            コンテンツカレンダー
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-[3.25rem]">
          戦略的な投稿計画を自動生成
        </p>
      </div>

      {/* メインコンテンツ: 設定パネルとカレンダー */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* 左: 生成設定 */}
        <div className="lg:col-span-1">
          <CalendarGenerator />
        </div>

        {/* 右: カレンダー表示 */}
        <div className="lg:col-span-3">
          <CalendarView />
        </div>
      </div>
    </div>
    </AnimatedPage>
  );
}
