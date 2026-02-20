"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import type { GeneratedCaption, HookType } from "@/lib/types";
import { cn } from "@/lib/utils";

// フックタイプ別のエンゲージメント予測
const engagementPrediction: Record<
  HookType,
  { level: string; label: string; color: string }
> = {
  curiosity: {
    level: "high",
    label: "高",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  controversy: {
    level: "very-high",
    label: "非常に高",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  story: {
    level: "high",
    label: "高",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  number: {
    level: "medium-high",
    label: "やや高",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  question: {
    level: "very-high",
    label: "非常に高",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  shock: {
    level: "high",
    label: "高",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
};

// キャプション表示時の最大文字数（切り詰め用）
const TRUNCATE_LENGTH = 100;

interface InstagramPreviewProps {
  caption: GeneratedCaption;
}

export function InstagramPreview({ caption }: InstagramPreviewProps) {
  const [expanded, setExpanded] = useState(false);

  // キャプション本文（ハッシュタグ除く）
  const captionBody = useMemo(() => {
    // fullCaptionからハッシュタグ行を除去した本文
    const lines = caption.fullCaption.split("\n");
    const bodyLines = lines.filter(
      (line) => !line.trim().startsWith("#") || line.trim() === ""
    );
    return bodyLines.join("\n").trim();
  }, [caption.fullCaption]);

  // ハッシュタグ文字列
  const hashtagText = caption.hashtags.join(" ");

  // 切り詰め判定
  const needsTruncation = captionBody.length > TRUNCATE_LENGTH;
  const truncatedText = needsTruncation
    ? captionBody.slice(0, TRUNCATE_LENGTH)
    : captionBody;

  // エンゲージメント予測
  const prediction = engagementPrediction[caption.input.hookType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      role="region"
      aria-label="Instagramプレビュー"
    >
      <div className="rounded-2xl border border-zinc-700/50 bg-zinc-950 overflow-hidden max-w-md mx-auto">
        {/* ヘッダー: プロフィール情報 */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {/* プロフィール画像プレースホルダー */}
            <div
              className="size-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-[2px]"
              aria-hidden="true"
            >
              <div className="size-full rounded-full bg-zinc-900 flex items-center justify-center">
                <span className="text-[10px] font-bold text-zinc-400">
                  IG
                </span>
              </div>
            </div>
            <span className="text-sm font-semibold text-zinc-100">
              your_account
            </span>
          </div>
          <button
            type="button"
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
            aria-label="その他のオプション"
          >
            <MoreHorizontal className="size-5" />
          </button>
        </div>

        {/* 画像プレースホルダー */}
        <div
          className="aspect-square w-full bg-zinc-800/50 flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="text-center space-y-2">
            <div className="text-4xl">📸</div>
            <p className="text-xs text-zinc-600">投稿画像プレビュー</p>
          </div>
        </div>

        {/* アクションアイコン */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4" aria-label="投稿アクション">
            <Heart
              className="size-6 text-zinc-200 hover:text-red-400 transition-colors cursor-pointer"
              aria-label="いいね"
            />
            <MessageCircle
              className="size-6 text-zinc-200 hover:text-zinc-400 transition-colors cursor-pointer"
              aria-label="コメント"
            />
            <Send
              className="size-6 text-zinc-200 hover:text-zinc-400 transition-colors cursor-pointer"
              aria-label="シェア"
            />
          </div>
          <Bookmark
            className="size-6 text-zinc-200 hover:text-zinc-400 transition-colors cursor-pointer"
            aria-label="保存"
          />
        </div>

        {/* いいね数 */}
        <div className="px-4 pb-1">
          <p className="text-sm font-semibold text-zinc-200">
            いいね! --- 件
          </p>
        </div>

        {/* キャプション本文 */}
        <div className="px-4 pb-3">
          <div className="text-sm leading-relaxed text-zinc-300">
            <span className="font-semibold text-zinc-100 mr-1.5">
              your_account
            </span>
            {expanded || !needsTruncation ? (
              <>
                <span className="whitespace-pre-wrap">{captionBody}</span>
                {/* ハッシュタグ */}
                {hashtagText && (
                  <span className="text-blue-400 block mt-1">
                    {hashtagText}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="whitespace-pre-wrap">{truncatedText}</span>
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="text-zinc-500 hover:text-zinc-400 transition-colors ml-0.5"
                  aria-label="キャプションの全文を表示"
                >
                  ...もっと見る
                </button>
              </>
            )}
          </div>
        </div>

        {/* エンゲージメント予測バッジ */}
        <div className="px-4 pb-4">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
              prediction.color
            )}
          >
            <span aria-hidden="true">
              {prediction.level === "very-high"
                ? "🔥"
                : prediction.level === "high"
                  ? "📈"
                  : "📊"}
            </span>
            <span>エンゲージメント予測: {prediction.label}</span>
          </div>
        </div>

        {/* タイムスタンプ */}
        <div className="px-4 pb-4">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider">
            たった今
          </p>
        </div>
      </div>
    </motion.div>
  );
}
