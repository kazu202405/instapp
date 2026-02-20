"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Moon,
  Sun,
  Monitor,
  Palette,
  SlidersHorizontal,
  Database,
  Info,
  AlertTriangle,
  Trash2,
  Sparkles,
  CalendarDays,
  BarChart3,
  FlaskConical,
  Film,
  FileText,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { useThemeStore, type Theme } from "@/store/themeStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useCaptionStore } from "@/store/captionStore";
import { useCalendarStore } from "@/store/calendarStore";
import { useAnalysisStore } from "@/store/analysisStore";
import { useABTestStore } from "@/store/abtestStore";
import { useReelStore } from "@/store/reelStore";
import { useProfileStore } from "@/store/profileStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import type { Genre } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ジャンル表示名マップ（CaptionFormと同一）
const genreDisplayNames: Record<Genre, string> = {
  fitness: "フィットネス",
  food: "料理・グルメ",
  travel: "旅行",
  beauty: "美容",
  business: "ビジネス",
  lifestyle: "ライフスタイル",
  tech: "テクノロジー",
  education: "学び・教育",
  fashion: "ファッション",
  photography: "写真",
};

// テーマの設定情報
const themeOptions: { value: Theme; label: string; icon: typeof Moon; description: string }[] = [
  { value: "dark", label: "ダーク", icon: Moon, description: "目に優しいダークテーマ" },
  { value: "light", label: "ライト", icon: Sun, description: "明るいライトテーマ" },
  { value: "system", label: "システム", icon: Monitor, description: "OSの設定に従う" },
];

// localStorageのストアキー一覧
const STORE_KEYS = [
  "instagrowth-captions",
  "instagrowth-analysis",
  "instagrowth-calendar",
  "instagrowth-profile",
  "instagrowth-abtest",
  "instagrowth-reels",
  "instagrowth-settings",
  "instagrowth-theme",
  "instagrowth-auth",
] as const;

export default function SettingsPage() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const logout = useAuthStore((s) => s.logout);

  const defaultGenre = useSettingsStore((s) => s.defaultGenre);
  const defaultPostTime = useSettingsStore((s) => s.defaultPostTime);
  const setDefaultGenre = useSettingsStore((s) => s.setDefaultGenre);
  const setDefaultPostTime = useSettingsStore((s) => s.setDefaultPostTime);

  const captionCount = useCaptionStore((s) => s.captions.length);
  const favoritesCount = useCaptionStore((s) => s.favorites.length);
  const calendarCount = useCalendarStore((s) => s.entries.length);
  const analysisCount = useAnalysisStore((s) => s.posts.length);
  const abtestCount = useABTestStore((s) => s.tests.length);
  const reelCount = useReelStore((s) => s.scripts.length);
  const profileItemCount = useProfileStore((s) => s.checkItems.length);

  const [storageSize, setStorageSize] = useState("計算中...");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // localStorageの使用量を計算
  useEffect(() => {
    try {
      let totalBytes = 0;
      for (const key of STORE_KEYS) {
        const value = localStorage.getItem(key);
        if (value) {
          totalBytes += new Blob([value]).size;
        }
      }
      if (totalBytes < 1024) {
        setStorageSize(`${totalBytes} B`);
      } else if (totalBytes < 1024 * 1024) {
        setStorageSize(`${(totalBytes / 1024).toFixed(1)} KB`);
      } else {
        setStorageSize(`${(totalBytes / (1024 * 1024)).toFixed(2)} MB`);
      }
    } catch {
      setStorageSize("取得できません");
    }
  }, [captionCount, calendarCount, analysisCount, abtestCount, reelCount]);

  // テーマ変更ハンドラ
  const handleThemeChange = useCallback(
    (newTheme: Theme) => {
      setTheme(newTheme);
      const label = themeOptions.find((t) => t.value === newTheme)?.label ?? newTheme;
      toast.success(`テーマを${label}に変更しました`);
    },
    [setTheme]
  );

  // 全データリセットハンドラ
  const handleReset = useCallback(() => {
    try {
      for (const key of STORE_KEYS) {
        localStorage.removeItem(key);
      }
      // サイドバー状態もクリア
      localStorage.removeItem("sidebar-collapsed");

      toast.success("全データをリセットしました");
      setShowResetConfirm(false);

      // ページリロードでストアをリセット
      window.location.reload();
    } catch {
      toast.error("データのリセットに失敗しました");
    }
  }, []);

  // デフォルトジャンル変更ハンドラ
  const handleGenreChange = useCallback(
    (value: string) => {
      setDefaultGenre(value);
      const label = value
        ? genreDisplayNames[value as Genre] ?? value
        : "未設定";
      toast.success(`デフォルトジャンルを「${label}」に設定しました`);
    },
    [setDefaultGenre]
  );

  // デフォルト投稿時間変更ハンドラ
  const handlePostTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDefaultPostTime(e.target.value);
    },
    [setDefaultPostTime]
  );

  // データ件数の項目リスト
  const dataCountItems = [
    { label: "キャプション数", count: captionCount, icon: Sparkles, color: "text-purple-400" },
    { label: "お気に入り数", count: favoritesCount, icon: FileText, color: "text-yellow-400" },
    { label: "カレンダーエントリ数", count: calendarCount, icon: CalendarDays, color: "text-sky-400" },
    { label: "分析数", count: analysisCount, icon: BarChart3, color: "text-emerald-400" },
    { label: "A/Bテスト数", count: abtestCount, icon: FlaskConical, color: "text-orange-400" },
    { label: "リール台本数", count: reelCount, icon: Film, color: "text-pink-400" },
    { label: "プロフィール項目数", count: profileItemCount, icon: FileText, color: "text-violet-400" },
  ];

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
                <Settings className="size-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  設定
                </h1>
                <p className="text-sm text-muted-foreground">
                  アプリの各種設定を管理
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">

          {/* テーマ設定 */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Palette className="size-5 text-purple-400" aria-hidden="true" />
                テーマ設定
              </CardTitle>
              <CardDescription>
                アプリの外観テーマを選択します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="grid grid-cols-3 gap-3"
                role="radiogroup"
                aria-label="テーマを選択"
              >
                {themeOptions.map((option) => {
                  const isSelected = theme === option.value;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${option.label}: ${option.description}`}
                      onClick={() => handleThemeChange(option.value)}
                      className={cn(
                        "relative flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-all duration-200",
                        "border bg-card/80 dark:bg-zinc-900/50 hover:bg-muted/70",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
                        isSelected
                          ? "border-transparent bg-muted/80 shadow-lg shadow-purple-900/20"
                          : "border-border/50 hover:border-border"
                      )}
                    >
                      {/* 選択時のグラデーションボーダー */}
                      {isSelected && (
                        <span
                          className="pointer-events-none absolute inset-0 rounded-xl"
                          style={{
                            padding: '2px',
                            background: 'linear-gradient(135deg, #9333ea, #ec4899, #f97316)',
                            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            WebkitMaskComposite: 'xor',
                            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            maskComposite: 'exclude',
                          }}
                          aria-hidden="true"
                        />
                      )}
                      <Icon
                        className={cn(
                          "size-6 transition-colors duration-200",
                          isSelected ? "text-pink-400" : "text-muted-foreground"
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-semibold leading-tight",
                          isSelected
                            ? "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                            : "text-foreground"
                        )}
                      >
                        {option.label}
                      </span>
                      <span className="text-[11px] leading-snug text-muted-foreground">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* デフォルト設定 */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <SlidersHorizontal className="size-5 text-sky-400" aria-hidden="true" />
                デフォルト設定
              </CardTitle>
              <CardDescription>
                キャプション生成時のデフォルト値を設定します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* デフォルトジャンル */}
              <div className="space-y-2">
                <Label htmlFor="default-genre" className="text-sm font-medium text-muted-foreground">
                  デフォルトジャンル
                </Label>
                <Select
                  value={defaultGenre}
                  onValueChange={handleGenreChange}
                >
                  <SelectTrigger
                    id="default-genre"
                    className="w-full bg-card/80 dark:bg-zinc-900/50 border-border/50 hover:border-border transition-colors"
                    aria-label="デフォルトジャンルを選択"
                  >
                    <SelectValue placeholder="ジャンルを選択..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {(Object.entries(genreDisplayNames) as [Genre, string][]).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* デフォルト投稿時間 */}
              <div className="space-y-2">
                <Label htmlFor="default-post-time" className="text-sm font-medium text-muted-foreground">
                  デフォルト投稿時間
                </Label>
                <Input
                  id="default-post-time"
                  type="time"
                  value={defaultPostTime}
                  onChange={handlePostTimeChange}
                  className="w-full bg-card/80 dark:bg-zinc-900/50 border-border/50 hover:border-border focus-visible:border-purple-500 transition-colors"
                  aria-label="デフォルト投稿時間を設定"
                />
                <p className="text-xs text-muted-foreground/60">
                  カレンダーに予定を追加する際のデフォルト時間です
                </p>
              </div>
            </CardContent>
          </Card>

          {/* データ管理 */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Database className="size-5 text-emerald-400" aria-hidden="true" />
                データ管理
              </CardTitle>
              <CardDescription>
                保存データの確認とリセット
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* ストレージ使用量 */}
              <div className="flex items-center justify-between rounded-lg bg-muted/40 dark:bg-zinc-900/30 px-4 py-3">
                <span className="text-sm text-muted-foreground">ストレージ使用量</span>
                <span className="text-sm font-medium text-foreground">{storageSize}</span>
              </div>

              <Separator className="bg-border/50" />

              {/* データ件数一覧 */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground px-1">保存データ件数</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {dataCountItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-lg bg-muted/40 dark:bg-zinc-900/30 px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={cn("size-4", item.color)} aria-hidden="true" />
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                        </div>
                        <span className="text-sm font-medium text-foreground tabular-nums">
                          {item.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* リセットボタン */}
              <Button
                variant="outline"
                onClick={() => setShowResetConfirm(true)}
                className="w-full justify-start gap-3 border-border bg-muted/50 text-foreground hover:bg-red-100 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-300 hover:border-red-300 dark:hover:border-red-800/50 h-12"
              >
                <Trash2 className="size-4 text-red-400" aria-hidden="true" />
                <div className="text-left">
                  <span className="block text-sm font-medium">全データをリセット</span>
                  <span className="block text-[11px] text-muted-foreground">
                    全てのデータを削除して初期状態に戻します
                  </span>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* アプリ情報 */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Info className="size-5 text-pink-400" aria-hidden="true" />
                アプリ情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
                  <Sparkles className="size-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">InstaGrowth</p>
                  <p className="text-xs text-muted-foreground">v0.1.0</p>
                </div>
              </div>
              <Separator className="bg-border/50" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                行動科学ベースのInstagram成長支援ツール
              </p>
              <div className="rounded-lg bg-muted/40 dark:bg-zinc-900/30 px-4 py-3 space-y-1.5">
                <p className="text-xs text-muted-foreground/80">
                  キャプション生成、投稿分析、カレンダー管理、A/Bテストなどの機能を通じて、
                  科学的なアプローチでInstagramアカウントの成長を支援します。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ログアウト */}
          <Button
            variant="outline"
            onClick={logout}
            className="w-full justify-start gap-3 border-border bg-card text-foreground hover:bg-muted/70 h-12"
          >
            <LogOut className="size-4 text-muted-foreground" aria-hidden="true" />
            <div className="text-left">
              <span className="block text-sm font-medium">ログアウト</span>
              <span className="block text-[11px] text-muted-foreground">
                ログイン画面に戻ります
              </span>
            </div>
          </Button>
        </main>
      </div>

      {/* リセット確認ダイアログ */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="bg-card border-border sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="size-5 text-red-400" aria-hidden="true" />
              全データの削除確認
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              全てのキャプション履歴、お気に入り、分析データ、カレンダー、プロフィール、A/Bテスト、リール台本、設定データが削除されます。この操作は元に戻せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="border-border text-muted-foreground"
              >
                キャンセル
              </Button>
            </DialogClose>
            <Button
              onClick={handleReset}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              全て削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  );
}
