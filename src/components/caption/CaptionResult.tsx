"use client";

import { useState, useCallback } from "react";
import {
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  Brain,
  Lightbulb,
  BookOpen,
  Gift,
  MousePointerClick,
} from "lucide-react";
import type { GeneratedCaption } from "@/lib/types";
import { toast } from "sonner";
import { cn, copyToClipboard } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScheduleModal } from "@/components/caption/ScheduleModal";

// キャプションの各セクション定義
const sectionConfig = [
  {
    key: "hook" as const,
    label: "フック",
    icon: Lightbulb,
    color: "from-purple-500 to-purple-600",
    badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  {
    key: "story" as const,
    label: "ストーリー",
    icon: BookOpen,
    color: "from-pink-500 to-pink-600",
    badgeClass: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  },
  {
    key: "value" as const,
    label: "価値提供",
    icon: Gift,
    color: "from-orange-500 to-orange-600",
    badgeClass: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  },
  {
    key: "cta" as const,
    label: "CTA",
    icon: MousePointerClick,
    color: "from-emerald-500 to-emerald-600",
    badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
];

interface CaptionResultProps {
  caption: GeneratedCaption;
  onRegenerate: () => void;
}

export function CaptionResult({ caption, onRegenerate }: CaptionResultProps) {
  const [copied, setCopied] = useState(false);
  const [reasonExpanded, setReasonExpanded] = useState(false);

  // クリップボードにコピー
  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(caption.fullCaption);
    if (success) {
      setCopied(true);
      toast.success("クリップボードにコピーしました");
      setTimeout(() => setCopied(false), 2000);
    }
  }, [caption.fullCaption]);

  // 再生成ハンドラ（トースト付き）
  const handleRegenerate = useCallback(() => {
    toast("キャプションを再生成中...");
    onRegenerate();
  }, [onRegenerate]);

  return (
    <div
      className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
      role="region"
      aria-label="生成されたキャプション"
    >
      <Card className="border-border/50 bg-card/80 dark:bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
        {/* グラデーションアクセント上部 */}
        <div
          className="h-1 w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500"
          aria-hidden="true"
        />

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-foreground">
              生成結果
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                className="gap-1.5 border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="キャプションを再生成"
              >
                <RefreshCw className="size-3.5" aria-hidden="true" />
                再生成
              </Button>
              <ScheduleModal
                hookLine={caption.hook}
                theme={caption.input.theme}
                genre={caption.input.genre}
                hookType={caption.input.hookType}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className={cn(
                  "gap-1.5 border-border transition-all duration-200",
                  copied
                    ? "bg-emerald-900/50 border-emerald-600/50 text-emerald-300"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-label={copied ? "コピーしました" : "キャプションをコピー"}
              >
                {copied ? (
                  <>
                    <Check className="size-3.5" aria-hidden="true" />
                    コピー済み
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" aria-hidden="true" />
                    コピー
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 4幕構造の各セクション */}
          <div className="space-y-3">
            {sectionConfig.map((section) => {
              const Icon = section.icon;
              const text = caption[section.key];
              return (
                <div key={section.key} className="space-y-1.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1 text-[11px] font-semibold",
                      section.badgeClass
                    )}
                  >
                    <Icon className="size-3" aria-hidden="true" />
                    {section.label}
                  </Badge>
                  <p className="text-sm leading-relaxed text-foreground pl-1 whitespace-pre-wrap">
                    {text}
                  </p>
                </div>
              );
            })}
          </div>

          <Separator className="bg-border/50" />

          {/* ハッシュタグ表示 */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">ハッシュタグ</p>
            <div
              className="flex flex-wrap gap-1.5"
              role="list"
              aria-label="生成されたハッシュタグ"
            >
              {caption.hashtags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-muted text-purple-300 border border-border/50 text-xs font-normal hover:bg-muted/80 transition-colors cursor-default"
                  role="listitem"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* 行動科学的理由（アコーディオン） */}
          <div className="rounded-lg border border-border/40 bg-muted/30 overflow-hidden">
            <button
              type="button"
              onClick={() => setReasonExpanded(!reasonExpanded)}
              className={cn(
                "flex w-full items-center justify-between px-4 py-3 text-left transition-colors",
                "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-inset"
              )}
              aria-expanded={reasonExpanded}
              aria-controls="reason-content"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Brain className="size-4 text-purple-400" aria-hidden="true" />
                なぜこのフック？
              </span>
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform duration-200",
                  reasonExpanded && "rotate-180"
                )}
                aria-hidden="true"
              />
            </button>

            <div
              id="reason-content"
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                reasonExpanded
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              )}
              role="region"
              aria-label="行動科学的な理由の詳細"
            >
              <div className="overflow-hidden">
                <div className="space-y-4 px-4 pb-4">
                  {/* フック理由 */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                      <Lightbulb className="size-3" aria-hidden="true" />
                      フック選択の心理学
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {caption.hookReason}
                    </p>
                  </div>

                  {/* CTA理由 */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <MousePointerClick
                        className="size-3"
                        aria-hidden="true"
                      />
                      CTA設計の心理学
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {caption.ctaReason}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
