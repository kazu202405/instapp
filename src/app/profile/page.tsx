"use client";

import { UserCircle } from "lucide-react";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { ProfileChecklist } from "@/components/profile/ProfileChecklist";
import { BioGenerator } from "@/components/profile/BioGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
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
              <UserCircle className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                プロフィール最適化
              </h1>
              <p className="text-sm text-muted-foreground">
                行動科学に基づくプロフィール診断
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="bio" className="w-full">
          <TabsList className="w-full mb-6 bg-muted/60 border border-border">
            <TabsTrigger
              value="bio"
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600/20 data-[state=active]:to-pink-600/20 data-[state=active]:text-foreground"
            >
              バイオ生成
            </TabsTrigger>
            <TabsTrigger
              value="checklist"
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600/20 data-[state=active]:to-pink-600/20 data-[state=active]:text-foreground"
            >
              チェックリスト
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bio">
            <BioGenerator />
          </TabsContent>

          <TabsContent value="checklist">
            <ProfileChecklist />
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </AnimatedPage>
  );
}
