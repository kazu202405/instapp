"use client";

import { FileText } from "lucide-react";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { TemplateLibrary } from "@/components/templates/TemplateLibrary";

/**
 * コンテンツテンプレート集ページ
 * ジャンル別の「そのまま使える」キャプションテンプレートを提供
 */
export default function TemplatesPage() {
  return (
    <AnimatedPage>
    <div className="space-y-8">
      {/* ページヘッダー */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            テンプレート集
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-[3.25rem]">
          ジャンル別の「そのまま使える」キャプションテンプレート
        </p>
      </div>

      {/* テンプレートライブラリ */}
      <TemplateLibrary />
    </div>
    </AnimatedPage>
  );
}
