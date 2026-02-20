"use client";

import { useCallback, useState } from "react";
import {
  Film,
  Loader2,
  Hash,
} from "lucide-react";
import type { Genre, HookType } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  generateReelScript,
  type ReelScript,
  type ReelScriptInput,
} from "@/engine/reel/generator";
import type { ReelStyle } from "@/data/reelTemplates";
import { useReelStore } from "@/store/reelStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ジャンル表示名マップ
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

// フックタイプ表示名
const hookTypeDisplayNames: Record<HookType, string> = {
  curiosity: "好奇心ギャップ",
  controversy: "議論・逆張り",
  story: "ストーリー",
  number: "数字インパクト",
  question: "問いかけ",
  shock: "衝撃・暴露",
};

// リールスタイル表示情報
const reelStyleInfo: { value: ReelStyle; label: string; description: string }[] = [
  { value: "教育", label: "教育", description: "ノウハウを分かりやすく" },
  { value: "ストーリー", label: "ストーリー", description: "体験談で引き込む" },
  { value: "ビフォーアフター", label: "ビフォーアフター", description: "変化の過程を見せる" },
  { value: "リスト", label: "リスト", description: "テンポよく情報提供" },
  { value: "チュートリアル", label: "チュートリアル", description: "手順を追って解説" },
];

// 動画長さの選択肢
const durationOptions: { value: 15 | 30 | 60 | 90; label: string; sections: string }[] = [
  { value: 15, label: "15秒", sections: "2セクション" },
  { value: 30, label: "30秒", sections: "3セクション" },
  { value: 60, label: "60秒", sections: "5セクション" },
  { value: 90, label: "90秒", sections: "7セクション" },
];

interface ReelFormProps {
  onGenerated: (script: ReelScript) => void;
}

/**
 * リール台本生成フォームコンポーネント
 * ジャンル、テーマ、動画長さ、スタイル等を入力して台本を生成
 */
export function ReelForm({ onGenerated }: ReelFormProps) {
  // フォーム状態
  const [genre, setGenre] = useState<Genre | "">("");
  const [theme, setTheme] = useState("");
  const [duration, setDuration] = useState<15 | 30 | 60 | 90>(30);
  const [style, setStyle] = useState<ReelStyle>("教育");
  const [keywordsText, setKeywordsText] = useState("");
  const [hookType, setHookType] = useState<HookType | "">("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { addScript } = useReelStore();

  // バリデーション
  const isValid = genre && theme.trim() && hookType;

  // 台本生成ハンドラ
  const handleGenerate = useCallback(async () => {
    if (!isValid) {
      toast.error("必須項目を入力してください");
      return;
    }

    setIsGenerating(true);

    // キーワードをパース
    const keywords = keywordsText
      .split(/[,、，\s]+/)
      .map((k) => k.trim())
      .filter(Boolean);

    const input: ReelScriptInput = {
      genre: genre as Genre,
      theme: theme.trim(),
      duration,
      style,
      keywords,
      hookType: hookType as HookType,
    };

    // 生成処理に遅延を入れてUI体験を向上
    await new Promise((resolve) => setTimeout(resolve, 800));

    const script = generateReelScript(input);
    addScript(script);
    onGenerated(script);
    toast.success("リール台本を生成しました");

    setIsGenerating(false);
  }, [genre, theme, duration, style, keywordsText, hookType, isValid, addScript, onGenerated]);

  return (
    <Card className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          台本設定
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {/* ジャンル選択 */}
          <div className="space-y-1.5">
            <Label htmlFor="reel-genre" className="text-sm font-medium text-muted-foreground">
              ジャンル
            </Label>
            <Select
              value={genre}
              onValueChange={(v) => setGenre(v as Genre)}
            >
              <SelectTrigger
                id="reel-genre"
                className="w-full bg-card/80 dark:bg-zinc-900/50 border-border/50 hover:border-border transition-colors"
                aria-label="ジャンルを選択"
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

          {/* テーマ入力 */}
          <div className="space-y-1.5">
            <Label htmlFor="reel-theme" className="text-sm font-medium text-muted-foreground">
              テーマ
            </Label>
            <Input
              id="reel-theme"
              placeholder="例: 朝のルーティン、簡単レシピ..."
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-card/80 dark:bg-zinc-900/50 border-border/50 hover:border-border focus-visible:border-purple-500 transition-colors"
              aria-label="テーマを入力"
            />
          </div>

          {/* 動画長さ（ラジオ） */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              動画の長さ
            </Label>
            <div
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
              role="radiogroup"
              aria-label="動画の長さを選択"
            >
              {durationOptions.map((opt) => {
                const isSelected = duration === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setDuration(opt.value)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 rounded-xl p-3 text-center transition-all duration-200",
                      "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
                      isSelected
                        ? "border-purple-500/50 bg-purple-500/10 text-white"
                        : "border-border/50 bg-card/80 dark:bg-zinc-900/50 text-muted-foreground hover:border-border hover:text-foreground"
                    )}
                  >
                    <span className="text-lg font-bold">{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {opt.sections}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* スタイルセレクト */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              スタイル
            </Label>
            <div
              className="grid grid-cols-2 gap-2 sm:grid-cols-3"
              role="radiogroup"
              aria-label="スタイルを選択"
            >
              {reelStyleInfo.map((s) => {
                const isSelected = style === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setStyle(s.value)}
                    className={cn(
                      "flex flex-col items-start gap-0.5 rounded-xl p-3 text-left transition-all duration-200",
                      "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
                      isSelected
                        ? "border-pink-500/50 bg-pink-500/10 text-white"
                        : "border-border/50 bg-card/80 dark:bg-zinc-900/50 text-muted-foreground hover:border-border hover:text-foreground"
                    )}
                  >
                    <span className="text-sm font-semibold">{s.label}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {s.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* キーワード入力 */}
          <div className="space-y-1.5">
            <Label
              htmlFor="reel-keywords"
              className="text-sm font-medium text-muted-foreground"
            >
              キーワード
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                カンマ区切りで複数入力可
              </span>
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="reel-keywords"
                placeholder="例: 初心者, 簡単, おすすめ"
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                className="pl-9 bg-card/80 dark:bg-zinc-900/50 border-border/50 hover:border-border focus-visible:border-purple-500 transition-colors"
                aria-label="キーワードを入力"
              />
            </div>
          </div>

          {/* フックタイプ */}
          <div className="space-y-1.5">
            <Label htmlFor="reel-hook" className="text-sm font-medium text-muted-foreground">
              フックタイプ
            </Label>
            <Select
              value={hookType}
              onValueChange={(v) => setHookType(v as HookType)}
            >
              <SelectTrigger
                id="reel-hook"
                className="w-full bg-card/80 dark:bg-zinc-900/50 border-border/50 hover:border-border transition-colors"
                aria-label="フックタイプを選択"
              >
                <SelectValue placeholder="フックタイプを選択..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {(Object.entries(hookTypeDisplayNames) as [HookType, string][]).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* 生成ボタン */}
          <Button
            onClick={handleGenerate}
            disabled={!isValid || isGenerating}
            className={cn(
              "w-full h-12 rounded-xl text-base font-bold tracking-wide transition-all duration-300",
              "bg-gradient-to-r from-purple-600 to-pink-600",
              "hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:shadow-purple-900/30",
              "active:scale-[0.98]",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
            )}
            aria-label="台本を生成する"
          >
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.span
                  key="loading"
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  台本を生成中...
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Film className="size-5" aria-hidden="true" />
                  台本を生成する
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
