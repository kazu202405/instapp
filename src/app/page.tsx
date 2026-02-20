"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Sparkles,
  BarChart3,
  UserCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { useCaptionStore } from "@/store/captionStore";
import { useAnalysisStore } from "@/store/analysisStore";
import { useProfileStore } from "@/store/profileStore";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { PerformanceTrend } from "@/components/dashboard/PerformanceTrend";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { GrowthSimulator } from "@/components/dashboard/GrowthSimulator";

// オンボーディングカード定義
const onboardingCards = [
  {
    title: "キャプションを生成してみよう",
    description: "行動科学ベースの4幕構造キャプションを自動生成します",
    href: "/caption",
    icon: Sparkles,
    gradientFrom: "from-purple-600",
    gradientTo: "to-purple-400",
    borderColor: "hover:border-purple-700/50",
  },
  {
    title: "投稿を分析してみよう",
    description: "投稿のパフォーマンスを行動科学の視点で診断します",
    href: "/analyzer",
    icon: BarChart3,
    gradientFrom: "from-pink-600",
    gradientTo: "to-pink-400",
    borderColor: "hover:border-pink-700/50",
  },
  {
    title: "プロフィールを最適化しよう",
    description: "心理学に基づくチェックリストでプロフィールを改善します",
    href: "/profile",
    icon: UserCircle,
    gradientFrom: "from-orange-600",
    gradientTo: "to-orange-400",
    borderColor: "hover:border-orange-700/50",
  },
] as const;

export default function DashboardPage() {
  const { captions } = useCaptionStore();
  const { posts } = useAnalysisStore();
  const { checkItems } = useProfileStore();

  // データがあるかどうかの判定
  const hasData = useMemo(() => {
    const hasCaptions = captions.length > 0;
    const hasPosts = posts.length > 0;
    const hasProfileActivity = checkItems.some((item) => item.completed);
    return hasCaptions || hasPosts || hasProfileActivity;
  }, [captions, posts, checkItems]);

  return (
    <AnimatedPage>
    <div className="min-h-svh w-full bg-background">
      {/* ページヘッダー */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-900/30"
              aria-hidden="true"
            >
              <LayoutDashboard className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                ダッシュボード
              </h1>
              <p className="text-sm text-muted-foreground">
                InstaGrowthへようこそ
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* クイック統計 */}
        <QuickStats />

        {hasData ? (
          /* データがある場合: チャート + アクティビティ */
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              {/* 左: パフォーマンス推移（3/5幅） */}
              <div className="lg:col-span-3">
                <PerformanceTrend />
              </div>

              {/* 右: 最近のアクティビティ（2/5幅） */}
              <div className="lg:col-span-2">
                <RecentActivity />
              </div>
            </div>

            {/* フォロワー成長シミュレーター */}
            <Card className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <TrendingUp className="size-4 text-pink-400" aria-hidden="true" />
                  フォロワー成長シミュレーター
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GrowthSimulator />
              </CardContent>
            </Card>
          </>
        ) : (
          /* データがない場合: オンボーディング */
          <section aria-label="はじめてのガイド">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                はじめましょう
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                以下の機能を試して、Instagram運用を最適化しましょう
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {onboardingCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="group block"
                  >
                    <Card
                      className={cn(
                        "border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm card-hover",
                        "transition-all duration-200",
                        card.borderColor,
                        "hover:bg-muted/60 hover:shadow-lg hover:shadow-purple-950/20"
                      )}
                    >
                      <CardContent className="pt-5 pb-5 space-y-3">
                        {/* アイコン */}
                        <div
                          className={cn(
                            "flex size-10 items-center justify-center rounded-xl",
                            "bg-gradient-to-br",
                            card.gradientFrom,
                            card.gradientTo,
                            "shadow-lg"
                          )}
                          aria-hidden="true"
                        >
                          <Icon className="size-5 text-white" />
                        </div>

                        {/* テキスト */}
                        <div>
                          <h3 className="text-sm font-semibold text-foreground group-hover:text-foreground transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {card.description}
                          </p>
                        </div>

                        {/* 矢印 */}
                        <div className="flex items-center gap-1 text-xs text-purple-400/70 group-hover:text-purple-400 transition-colors">
                          <span>始める</span>
                          <ArrowRight
                            className="size-3 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
    </AnimatedPage>
  );
}
