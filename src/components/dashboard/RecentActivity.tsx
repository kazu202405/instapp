"use client";

import { useMemo } from "react";
import {
  Sparkles,
  BarChart3,
  CalendarDays,
  Clock,
  FileText,
} from "lucide-react";
import { useCaptionStore } from "@/store/captionStore";
import { useAnalysisStore } from "@/store/analysisStore";
import { useCalendarStore } from "@/store/calendarStore";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// コンテンツピラーの日本語名
const pillarNames: Record<string, string> = {
  education: "教育",
  inspiration: "インスピレーション",
  connection: "つながり",
};

// 投稿フォーマットの日本語名
const formatNames: Record<string, string> = {
  reel: "リール",
  carousel: "カルーセル",
  image: "画像",
  story: "ストーリー",
};

export function RecentActivity() {
  const { captions } = useCaptionStore();
  const { posts, results } = useAnalysisStore();
  const { entries } = useCalendarStore();

  // 最新5件のキャプション
  const recentCaptions = useMemo(
    () => captions.slice(0, 5),
    [captions]
  );

  // 最新3件の分析済み投稿（スコア付き）
  const recentAnalyzed = useMemo(() => {
    return posts
      .filter((post) => results[post.id])
      .slice(0, 3)
      .map((post) => ({
        ...post,
        result: results[post.id],
      }));
  }, [posts, results]);

  // 次のスケジュール投稿
  const nextScheduled = useMemo(() => {
    const now = new Date().toISOString();
    return entries
      .filter((entry) => entry.status === "planned" && entry.date >= now.split("T")[0])
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      })[0] ?? null;
  }, [entries]);

  const hasAnyData =
    recentCaptions.length > 0 ||
    recentAnalyzed.length > 0 ||
    nextScheduled !== null;

  if (!hasAnyData) {
    return (
      <Card className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm h-full card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Clock className="size-4 text-pink-400" aria-hidden="true" />
            最近のアクティビティ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="size-8 text-muted-foreground/50 mb-2" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              まだアクティビティがありません
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              キャプション生成や投稿分析を始めると、ここに表示されます
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm h-full card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Clock className="size-4 text-pink-400" aria-hidden="true" />
          最近のアクティビティ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* 最新キャプション */}
        {recentCaptions.length > 0 && (
          <section aria-label="最新キャプション">
            <h4 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
              <Sparkles className="size-3" aria-hidden="true" />
              最新キャプション
            </h4>
            <ul className="space-y-1.5" role="list">
              {recentCaptions.map((caption) => (
                <li
                  key={caption.id}
                  className="rounded-md bg-muted/30 px-3 py-2 transition-colors hover:bg-muted/50"
                >
                  <p className="text-xs text-muted-foreground truncate leading-relaxed">
                    {caption.hook}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                    {formatDate(caption.createdAt, "MM/dd HH:mm")}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 最新分析結果 */}
        {recentAnalyzed.length > 0 && (
          <section aria-label="最新分析結果">
            <h4 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
              <BarChart3 className="size-3" aria-hidden="true" />
              最新分析
            </h4>
            <ul className="space-y-1.5" role="list">
              {recentAnalyzed.map(({ id, date, postFormat, contentPillar, result }) => (
                <li
                  key={id}
                  className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground truncate">
                      {formatNames[postFormat] ?? postFormat} / {pillarNames[contentPillar] ?? contentPillar}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70">
                      {formatDate(date, "MM/dd")}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "ml-2 shrink-0 text-sm font-bold tabular-nums",
                      result.overallScore >= 70
                        ? "text-emerald-400"
                        : result.overallScore >= 50
                          ? "text-yellow-400"
                          : "text-red-400"
                    )}
                  >
                    {result.overallScore}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 次のスケジュール */}
        {nextScheduled && (
          <section aria-label="次のスケジュール">
            <h4 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
              <CalendarDays className="size-3" aria-hidden="true" />
              次の予定投稿
            </h4>
            <div className="rounded-md bg-gradient-to-r from-purple-950/30 to-pink-950/30 border border-purple-800/20 px-3 py-2.5">
              <p className="text-xs font-medium text-foreground">
                {nextScheduled.theme}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                <span>
                  {formatDate(nextScheduled.date, "MM/dd")} {nextScheduled.time}
                </span>
                <span className="text-muted-foreground/50">|</span>
                <span>{formatNames[nextScheduled.format] ?? nextScheduled.format}</span>
                <span className="text-muted-foreground/50">|</span>
                <span>{pillarNames[nextScheduled.pillar] ?? nextScheduled.pillar}</span>
              </div>
            </div>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
