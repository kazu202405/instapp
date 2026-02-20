"use client";

import { FlaskConical } from "lucide-react";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HypothesisBuilder } from "@/components/abtest/HypothesisBuilder";
import { TestTracker } from "@/components/abtest/TestTracker";
import { useABTestStore } from "@/store/abtestStore";

export default function ABTestPage() {
  const { tests } = useABTestStore();

  // テスト数のカウント
  const activeCount = tests.filter((t) => t.status === "active").length;
  const completedCount = tests.filter((t) => t.status === "completed").length;

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
              <FlaskConical className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                A/Bテスト
              </h1>
              <p className="text-sm text-muted-foreground">
                心理原理ベースの仮説検証
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="templates">
              テンプレート
            </TabsTrigger>
            <TabsTrigger value="active">
              進行中
              {activeCount > 0 && (
                <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-purple-600/30 text-[10px] font-bold text-purple-300">
                  {activeCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              完了
              {completedCount > 0 && (
                <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-emerald-600/30 text-[10px] font-bold text-emerald-300">
                  {completedCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates">
            <HypothesisBuilder />
          </TabsContent>

          <TabsContent value="active">
            <TestTracker filter="active" />
          </TabsContent>

          <TabsContent value="completed">
            <TestTracker filter="completed" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </AnimatedPage>
  );
}
