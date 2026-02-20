"use client";

import { motion } from "framer-motion";
import {
  Clock,
  Eye,
  Copy,
  Music,
  MessageSquare,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import type { ReelScript, ReelSection } from "@/engine/reel/generator";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ReelTimelineProps {
  script: ReelScript | null;
}

/**
 * リール台本のタイムラインビューコンポーネント
 * 各セクションを縦のタイムラインとして表示
 * フック（紫）→ セクション（ピンク系）→ CTA（オレンジ）のグラデーション
 */
export function ReelTimeline({ script }: ReelTimelineProps) {
  if (!script) {
    return (
      <Card className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Video className="size-12 mb-3 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium">台本を生成してください</p>
          <p className="text-xs mt-1 text-muted-foreground">
            左のフォームから設定して生成ボタンを押してね
          </p>
        </CardContent>
      </Card>
    );
  }

  // 全セクションを組み立て（フック + 本編 + CTA）
  const allSections: { section: ReelSection; type: "hook" | "body" | "cta"; index: number }[] = [
    { section: script.hook, type: "hook", index: 0 },
    ...script.sections.map((s, i) => ({
      section: s,
      type: "body" as const,
      index: i + 1,
    })),
    {
      section: script.cta,
      type: "cta",
      index: script.sections.length + 1,
    },
  ];

  // プログレスバー用の累積時間計算
  const totalDuration = script.totalDuration;
  let accumulatedTime = 0;

  // 全文コピー
  const handleCopyAll = () => {
    const lines = [
      `【リール台本: ${script.input.theme}】`,
      `スタイル: ${script.input.style} / ${script.totalDuration}秒`,
      "",
      `--- フック (${script.hook.duration}秒) ---`,
      script.hook.text,
      `映像: ${script.hook.visualNote}`,
      "",
      ...script.sections.map((s, i) => [
        `--- セクション${i + 1} (${s.duration}秒) ---`,
        s.text,
        `映像: ${s.visualNote}`,
        "",
      ]).flat(),
      `--- CTA (${script.cta.duration}秒) ---`,
      script.cta.text,
      `映像: ${script.cta.visualNote}`,
      "",
      `--- キャプション ---`,
      script.caption,
      "",
      script.hashtags.join(" "),
      "",
      `BGM: ${script.musicSuggestion}`,
    ];

    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      toast.success("台本全文をコピーしました");
    });
  };

  // セクションの色を取得
  const getSectionColor = (type: "hook" | "body" | "cta", index: number) => {
    if (type === "hook") return {
      border: "border-purple-500",
      bg: "bg-purple-500/10",
      dot: "bg-purple-500",
      text: "text-purple-400",
      badge: "border-purple-500/30 bg-purple-500/10 text-purple-300",
      progress: "bg-purple-500",
    };
    if (type === "cta") return {
      border: "border-orange-500",
      bg: "bg-orange-500/10",
      dot: "bg-orange-500",
      text: "text-orange-400",
      badge: "border-orange-500/30 bg-orange-500/10 text-orange-300",
      progress: "bg-orange-500",
    };
    // 本編はピンク系のグラデーション
    const pinkShades = [
      { border: "border-pink-500", bg: "bg-pink-500/10", dot: "bg-pink-500", text: "text-pink-400", badge: "border-pink-500/30 bg-pink-500/10 text-pink-300", progress: "bg-pink-500" },
      { border: "border-pink-400", bg: "bg-pink-400/10", dot: "bg-pink-400", text: "text-pink-400", badge: "border-pink-400/30 bg-pink-400/10 text-pink-300", progress: "bg-pink-400" },
      { border: "border-rose-500", bg: "bg-rose-500/10", dot: "bg-rose-500", text: "text-rose-400", badge: "border-rose-500/30 bg-rose-500/10 text-rose-300", progress: "bg-rose-500" },
      { border: "border-rose-400", bg: "bg-rose-400/10", dot: "bg-rose-400", text: "text-rose-400", badge: "border-rose-400/30 bg-rose-400/10 text-rose-300", progress: "bg-rose-400" },
      { border: "border-fuchsia-500", bg: "bg-fuchsia-500/10", dot: "bg-fuchsia-500", text: "text-fuchsia-400", badge: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300", progress: "bg-fuchsia-500" },
      { border: "border-fuchsia-400", bg: "bg-fuchsia-400/10", dot: "bg-fuchsia-400", text: "text-fuchsia-400", badge: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300", progress: "bg-fuchsia-400" },
      { border: "border-amber-500", bg: "bg-amber-500/10", dot: "bg-amber-500", text: "text-amber-400", badge: "border-amber-500/30 bg-amber-500/10 text-amber-300", progress: "bg-amber-500" },
    ];
    return pinkShades[(index - 1) % pinkShades.length];
  };

  // セクションラベル
  const getSectionLabel = (type: "hook" | "body" | "cta", index: number) => {
    if (type === "hook") return "フック";
    if (type === "cta") return "CTA";
    return `セクション${index}`;
  };

  return (
    <Card className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Video className="size-4 text-pink-400" aria-hidden="true" />
            タイムライン
            <Badge
              variant="outline"
              className="border-border bg-muted/50 text-muted-foreground text-[10px] ml-1"
            >
              {script.totalDuration}秒 / {script.input.style}
            </Badge>
          </CardTitle>
          <Button
            onClick={handleCopyAll}
            variant="outline"
            size="sm"
            className="border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="台本全文をコピー"
          >
            <Copy className="size-3.5 mr-1.5" />
            全文コピー
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* プログレスバー（全体の時間配分） */}
        <div className="mb-6 space-y-1.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            時間配分
          </p>
          <div
            className="flex h-3 w-full overflow-hidden rounded-full bg-muted/60"
            role="img"
            aria-label={`時間配分: フック${script.hook.duration}秒、本編${script.sections.reduce((a, s) => a + s.duration, 0)}秒、CTA${script.cta.duration}秒`}
          >
            {allSections.map((item) => {
              const color = getSectionColor(item.type, item.index);
              const widthPercent = (item.section.duration / totalDuration) * 100;
              return (
                <div
                  key={`progress-${item.type}-${item.index}`}
                  className={cn("h-full transition-all", color.progress)}
                  style={{ width: `${widthPercent}%` }}
                  title={`${getSectionLabel(item.type, item.index)}: ${item.section.duration}秒`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0秒</span>
            <span>{totalDuration}秒</span>
          </div>
        </div>

        <Separator className="bg-border mb-4" />

        {/* タイムラインセクション */}
        <ScrollArea className="max-h-[600px] pr-2">
          <div className="relative space-y-0">
            {/* 縦のライン */}
            <div
              className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-purple-500 via-pink-500 to-orange-500 opacity-30"
              aria-hidden="true"
            />

            {allSections.map((item, i) => {
              const color = getSectionColor(item.type, item.index);
              const label = getSectionLabel(item.type, item.index);
              const startTime = accumulatedTime;
              accumulatedTime += item.section.duration;

              return (
                <motion.div
                  key={`section-${item.type}-${item.index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  className="relative pl-10 pb-4 last:pb-0"
                >
                  {/* タイムラインドット */}
                  <div
                    className={cn(
                      "absolute left-[9px] top-1.5 size-3 rounded-full ring-2 ring-card",
                      color.dot
                    )}
                    aria-hidden="true"
                  />

                  {/* セクションカード */}
                  <div
                    className={cn(
                      "rounded-xl border p-4 transition-all duration-200",
                      "bg-card/80 dark:bg-zinc-900/60 hover:bg-muted/60",
                      color.border,
                      "border-opacity-30"
                    )}
                  >
                    {/* ヘッダー */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] px-2 py-0", color.badge)}
                        >
                          {label}
                        </Badge>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="size-3" aria-hidden="true" />
                          {startTime}s - {startTime + item.section.duration}s
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-border/50 bg-muted/50 text-muted-foreground text-[10px] px-2 py-0"
                      >
                        {item.section.duration}秒
                      </Badge>
                    </div>

                    {/* テキスト */}
                    <p className="text-sm text-foreground leading-relaxed mb-3 whitespace-pre-wrap">
                      {item.section.text}
                    </p>

                    {/* 映像指示 */}
                    <div className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2">
                      <Eye
                        className={cn("size-3.5 shrink-0 mt-0.5", color.text)}
                        aria-hidden="true"
                      />
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {item.section.visualNote}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>

        <Separator className="bg-border mt-4 mb-4" />

        {/* キャプションとBGM情報 */}
        <div className="space-y-4">
          {/* 投稿キャプション */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-3.5 text-cyan-400" aria-hidden="true" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                投稿キャプション
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {script.caption}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {script.hashtags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-[10px]"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* BGM提案 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Music className="size-3.5 text-amber-400" aria-hidden="true" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                BGM提案
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {script.musicSuggestion}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
