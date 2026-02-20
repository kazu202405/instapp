"use client";

import { useState, useCallback } from "react";
import { Film } from "lucide-react";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import type { ReelScript } from "@/engine/reel/generator";
import { ReelForm } from "@/components/reel/ReelForm";
import { ReelTimeline } from "@/components/reel/ReelTimeline";
import { ReelHistory } from "@/components/reel/ReelHistory";

/**
 * リール台本生成ページ
 * 動画用の台本を自動生成する
 */
export default function ReelPage() {
  // 現在表示中の台本
  const [currentScript, setCurrentScript] = useState<ReelScript | null>(null);

  // 台本生成完了時のハンドラ
  const handleGenerated = useCallback((script: ReelScript) => {
    setCurrentScript(script);
  }, []);

  // 履歴から選択時のハンドラ
  const handleSelectFromHistory = useCallback((script: ReelScript) => {
    setCurrentScript(script);
  }, []);

  return (
    <AnimatedPage>
    <div className="space-y-8">
      {/* ページヘッダー */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
            <Film className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            リール台本
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-[3.25rem]">
          動画用の台本を自動生成
        </p>
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 左カラム: フォーム */}
        <div className="space-y-6">
          <ReelForm onGenerated={handleGenerated} />
        </div>

        {/* 右カラム: タイムライン */}
        <div className="space-y-6">
          <ReelTimeline script={currentScript} />
        </div>
      </div>

      {/* 下部: 生成履歴 */}
      <ReelHistory
        onSelect={handleSelectFromHistory}
        selectedId={currentScript?.id}
      />
    </div>
    </AnimatedPage>
  );
}
