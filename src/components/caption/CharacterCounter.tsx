"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Type, Hash } from "lucide-react";
import type { GeneratedCaption } from "@/lib/types";
import { cn } from "@/lib/utils";

// Instagramの制限値
const CAPTION_LIMIT = 2200;
const HASHTAG_LIMIT = 30;

/**
 * 使用率に基づいて色クラスを返す
 * 0-70%: 緑 / 70-90%: 黄 / 90-100%: 赤
 */
function getColorByPercentage(percentage: number): {
  bar: string;
  text: string;
  bg: string;
  icon: string;
} {
  if (percentage >= 90) {
    return {
      bar: "bg-red-500",
      text: "text-red-400",
      bg: "bg-red-500/10",
      icon: "text-red-400",
    };
  }
  if (percentage >= 70) {
    return {
      bar: "bg-amber-500",
      text: "text-amber-400",
      bg: "bg-amber-500/10",
      icon: "text-amber-400",
    };
  }
  return {
    bar: "bg-emerald-500",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    icon: "text-emerald-400",
  };
}

interface CharacterCounterProps {
  caption: GeneratedCaption;
}

export function CharacterCounter({ caption }: CharacterCounterProps) {
  // 文字数計算
  const charCount = caption.fullCaption.length;
  const charPercentage = Math.min((charCount / CAPTION_LIMIT) * 100, 100);
  const charColor = getColorByPercentage(charPercentage);

  // ハッシュタグ数計算
  const hashtagCount = caption.hashtags.length;
  const hashtagPercentage = Math.min(
    (hashtagCount / HASHTAG_LIMIT) * 100,
    100
  );
  const hashtagColor = getColorByPercentage(hashtagPercentage);

  // 警告判定
  const showCharWarning = charPercentage >= 90;
  const showHashtagWarning = hashtagPercentage >= 90;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
      role="region"
      aria-label="文字数カウンター"
    >
      <div className="rounded-2xl border border-border/50 bg-card/80 dark:bg-zinc-900/60 backdrop-blur-sm p-4 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">
          文字数・ハッシュタグ制限
        </h3>

        {/* キャプション文字数 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type
                className={cn("size-4", charColor.icon)}
                aria-hidden="true"
              />
              <span className="text-sm text-muted-foreground">キャプション文字数</span>
              {showCharWarning && (
                <AlertTriangle
                  className="size-3.5 text-red-400"
                  aria-label="文字数制限に近づいています"
                />
              )}
            </div>
            <span className={cn("text-sm font-mono font-medium", charColor.text)}>
              {charCount.toLocaleString()}{" "}
              <span className="text-muted-foreground">/ {CAPTION_LIMIT.toLocaleString()}</span>
            </span>
          </div>

          {/* プログレスバー */}
          <div
            className="h-2 w-full rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={charCount}
            aria-valuemin={0}
            aria-valuemax={CAPTION_LIMIT}
            aria-label={`キャプション文字数: ${charCount} / ${CAPTION_LIMIT}`}
          >
            <motion.div
              className={cn("h-full rounded-full", charColor.bar)}
              initial={{ width: 0 }}
              animate={{ width: `${charPercentage}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>

          {/* 残り文字数 */}
          <p className="text-[11px] text-muted-foreground">
            残り {Math.max(CAPTION_LIMIT - charCount, 0).toLocaleString()} 文字
            {charCount > CAPTION_LIMIT && (
              <span className="text-red-400 font-medium ml-1">
                ({(charCount - CAPTION_LIMIT).toLocaleString()} 文字超過)
              </span>
            )}
          </p>
        </div>

        {/* ハッシュタグ数 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash
                className={cn("size-4", hashtagColor.icon)}
                aria-hidden="true"
              />
              <span className="text-sm text-muted-foreground">ハッシュタグ数</span>
              {showHashtagWarning && (
                <AlertTriangle
                  className="size-3.5 text-red-400"
                  aria-label="ハッシュタグ制限に近づいています"
                />
              )}
            </div>
            <span
              className={cn(
                "text-sm font-mono font-medium",
                hashtagColor.text
              )}
            >
              {hashtagCount}{" "}
              <span className="text-muted-foreground">/ {HASHTAG_LIMIT}</span>
            </span>
          </div>

          {/* プログレスバー */}
          <div
            className="h-2 w-full rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={hashtagCount}
            aria-valuemin={0}
            aria-valuemax={HASHTAG_LIMIT}
            aria-label={`ハッシュタグ数: ${hashtagCount} / ${HASHTAG_LIMIT}`}
          >
            <motion.div
              className={cn("h-full rounded-full", hashtagColor.bar)}
              initial={{ width: 0 }}
              animate={{ width: `${hashtagPercentage}%` }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            />
          </div>

          {/* 残りハッシュタグ数 */}
          <p className="text-[11px] text-muted-foreground">
            残り {Math.max(HASHTAG_LIMIT - hashtagCount, 0)} 個
            {hashtagCount > HASHTAG_LIMIT && (
              <span className="text-red-400 font-medium ml-1">
                ({hashtagCount - HASHTAG_LIMIT} 個超過)
              </span>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
