"use client";

import { Suspense, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, History, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import type { GeneratedCaption } from "@/lib/types";
import { generateCaptionVariants } from "@/engine/caption/generator";
import { useCaptionStore } from "@/store/captionStore";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CaptionForm } from "@/components/caption/CaptionForm";
import { CaptionVariants } from "@/components/caption/CaptionVariants";
import { InstagramPreview } from "@/components/caption/InstagramPreview";
import { CharacterCounter } from "@/components/caption/CharacterCounter";
import { CaptionHistory } from "@/components/caption/CaptionHistory";
import { Confetti } from "@/components/effects/Confetti";

export default function CaptionPage() {
  // 3つのバリエーション
  const [variants, setVariants] = useState<GeneratedCaption[]>([]);
  // ユーザーが「この案を採用」で選んだキャプション
  const [selectedCaption, setSelectedCaption] =
    useState<GeneratedCaption | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // 紙吹雪エフェクトのトリガー
  const [showConfetti, setShowConfetti] = useState(false);
  // 初回生成かどうかの判定用（生成前のキャプション数を記録）
  const captionsCountBeforeGenerate = useRef<number | null>(null);

  const { captions, addCaption } = useCaptionStore();

  // 3つのバリエーション生成完了時のハンドラ
  const handleGenerated = useCallback((generatedCaptions: GeneratedCaption[]) => {
    setVariants(generatedCaptions);
    // 新しいバリエーション生成時は選択をリセット
    setSelectedCaption(null);

    // 初めてのキャプション生成マイルストーン: 生成前にキャプションが0件だった場合
    if (captionsCountBeforeGenerate.current === 0) {
      setShowConfetti(true);
      toast.success("初めてのキャプション生成おめでとう!");
      // 紙吹雪をリセット（次回のトリガー用）
      setTimeout(() => setShowConfetti(false), 3000);
    }
    captionsCountBeforeGenerate.current = null;
  }, []);

  // バリエーションから1つを採用するハンドラ
  const handleSelectVariant = useCallback((caption: GeneratedCaption) => {
    setSelectedCaption(caption);
  }, []);

  // 履歴から選択時のハンドラ（単一キャプションを表示）
  const handleSelectFromHistory = useCallback((caption: GeneratedCaption) => {
    setVariants([caption]);
    setSelectedCaption(caption);
  }, []);

  // 生成前に現在のキャプション数を記録（初回生成判定用）
  const handleBeforeGenerate = useCallback(() => {
    captionsCountBeforeGenerate.current = captions.length;
  }, [captions.length]);

  // 再生成ハンドラ（前回と同じ入力で再度3つ生成）
  const handleRegenerate = useCallback(() => {
    if (variants.length === 0) return;
    const input = variants[0].input;
    const newVariants = generateCaptionVariants(input, 3);
    for (const caption of newVariants) {
      addCaption(caption);
    }
    setVariants(newVariants);
    setSelectedCaption(null);
  }, [variants, addCaption]);

  return (
    <AnimatedPage>
    {/* 初回キャプション生成マイルストーンの紙吹雪エフェクト */}
    <Confetti trigger={showConfetti} />
    <div
      className="min-h-svh w-full bg-background"
    >
      {/* ページヘッダー */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-900/30"
              aria-hidden="true"
            >
              <Sparkles className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                キャプション生成
              </h1>
              <p className="text-sm text-muted-foreground">
                行動科学ベースの4幕構造キャプション - 3つのバリエーション比較
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* 左カラム: フォーム + バリエーション + プレビュー */}
          <div className="flex-1 space-y-6 lg:max-w-2xl">
            {/* フォームカード */}
            <Card className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">
                  キャプション設定
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="py-8 text-center text-sm text-muted-foreground">読み込み中...</div>}>
                  <CaptionForm
                    onGenerated={handleGenerated}
                    onBeforeGenerate={handleBeforeGenerate}
                  />
                </Suspense>
              </CardContent>
            </Card>

            {/* 3つのバリエーション表示 */}
            {variants.length > 0 && (
              <CaptionVariants
                variants={variants}
                onSelect={handleSelectVariant}
                selectedId={selectedCaption?.id}
              />
            )}

            {/* 採用されたキャプションのプレビューとカウンター */}
            {selectedCaption && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {/* Instagramプレビューとカウンターを横並び（大画面）/ 縦並び（小画面） */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Instagramプレビュー */}
                  <InstagramPreview caption={selectedCaption} />

                  {/* 文字数カウンター */}
                  <div className="space-y-4">
                    <CharacterCounter caption={selectedCaption} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* 右カラム: 履歴（デスクトップ） */}
          <aside
            className="hidden lg:block lg:w-80 xl:w-96"
            aria-label="キャプション履歴"
          >
            <div className="sticky top-24">
              <Card className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm h-[calc(100svh-8rem)] flex flex-col">
                <CardHeader className="pb-0 shrink-0">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <History className="size-4" aria-hidden="true" />
                    生成履歴
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden pt-4">
                  <CaptionHistory
                    onSelect={handleSelectFromHistory}
                    selectedId={selectedCaption?.id}
                  />
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* モバイル用: 履歴アコーディオン */}
          <div className="lg:hidden">
            <Card className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setHistoryOpen(!historyOpen)}
                className={cn(
                  "flex w-full items-center justify-between px-6 py-4 text-left transition-colors",
                  "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-inset"
                )}
                aria-expanded={historyOpen}
                aria-controls="mobile-history"
              >
                <span className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <History className="size-4" aria-hidden="true" />
                  生成履歴
                </span>
                <ChevronDown
                  className={cn(
                    "size-5 text-muted-foreground transition-transform duration-200",
                    historyOpen && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </button>
              <div
                id="mobile-history"
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  historyOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                )}
                role="region"
                aria-label="生成履歴"
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-4 max-h-96">
                    <CaptionHistory
                      onSelect={handleSelectFromHistory}
                      selectedId={selectedCaption?.id}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
    </AnimatedPage>
  );
}
