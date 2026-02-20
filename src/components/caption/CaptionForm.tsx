"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Loader2,
  Search,
  MessageSquare,
  BookOpen,
  Hash,
  HelpCircle,
  Zap,
  Wand2,
} from "lucide-react";
import type {
  Genre,
  HookType,
  TargetAction,
  CaptionInput,
  GeneratedCaption,
} from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { generateCaptionVariants } from "@/engine/caption/generator";
import { useCaptionStore } from "@/store/captionStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 生成モード型
export type GenerationMode = "template" | "ai";

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

// フックタイプ定義（カード表示用）
const hookTypeCards: {
  value: HookType;
  label: string;
  emoji: string;
  description: string;
}[] = [
  {
    value: "curiosity",
    label: "好奇心ギャップ",
    emoji: "🔍",
    description: "知りたい欲求を刺激する",
  },
  {
    value: "controversy",
    label: "議論・逆張り",
    emoji: "💬",
    description: "常識を覆して注目を集める",
  },
  {
    value: "story",
    label: "ストーリー",
    emoji: "📖",
    description: "物語で感情に訴えかける",
  },
  {
    value: "number",
    label: "数字インパクト",
    emoji: "#️⃣",
    description: "具体的な数字で説得力を出す",
  },
  {
    value: "question",
    label: "問いかけ",
    emoji: "❓",
    description: "質問で思考を促し引き込む",
  },
  {
    value: "shock",
    label: "衝撃・暴露",
    emoji: "⚡",
    description: "驚きの事実で目を止める",
  },
];

// ターゲットアクション表示名マップ
const targetActionDisplayNames: Record<TargetAction, string> = {
  save: "保存",
  share: "シェア",
  comment: "コメント",
  follow: "フォロー",
  click: "リンククリック",
};

// ターゲットアクションアイコンマップ
const targetActionIcons: Record<TargetAction, React.ReactNode> = {
  save: <Sparkles className="size-3.5" />,
  share: <Zap className="size-3.5" />,
  comment: <MessageSquare className="size-3.5" />,
  follow: <BookOpen className="size-3.5" />,
  click: <Search className="size-3.5" />,
};

interface CaptionFormProps {
  onGenerated: (captions: GeneratedCaption[]) => void;
  onBeforeGenerate?: () => void;
  onModeChange?: (mode: GenerationMode) => void;
}

// AI生成APIを呼び出す関数
async function generateWithAI(input: CaptionInput): Promise<GeneratedCaption[]> {
  const response = await fetch("/api/caption", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as {
    captions?: GeneratedCaption[];
    error?: string;
  };

  if (!response.ok || data.error) {
    throw new Error(data.error || "AI生成に失敗しました");
  }

  if (!data.captions || data.captions.length === 0) {
    throw new Error("AIからの応答が空でした");
  }

  return data.captions;
}

export function CaptionForm({ onGenerated, onBeforeGenerate, onModeChange }: CaptionFormProps) {
  const { currentInput, setCurrentInput, addCaption } = useCaptionStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [keywordsText, setKeywordsText] = useState("");
  const [generationMode, setGenerationMode] = useState<GenerationMode>("template");
  const searchParams = useSearchParams();

  // モード変更時に親へ通知
  const handleModeChange = useCallback(
    (mode: GenerationMode) => {
      setGenerationMode(mode);
      onModeChange?.(mode);
    },
    [onModeChange]
  );

  // カレンダーからのディープリンク: URLパラメータでフォームを自動入力
  const hasAppliedParams = useRef(false);
  useEffect(() => {
    if (hasAppliedParams.current) return;

    const fromParam = searchParams.get("from");
    if (fromParam !== "calendar") return;

    const themeParam = searchParams.get("theme");
    const hookTypeParam = searchParams.get("hookType");

    const updates: Partial<CaptionInput> = {};

    if (themeParam) {
      updates.theme = themeParam;
    }
    if (hookTypeParam) {
      updates.hookType = hookTypeParam as HookType;
    }

    if (Object.keys(updates).length > 0) {
      setCurrentInput(updates);
      hasAppliedParams.current = true;
    }
  }, [searchParams, setCurrentInput]);

  // バリデーション: 必須フィールドが揃っているか
  const isValid =
    currentInput.genre &&
    currentInput.theme?.trim() &&
    currentInput.targetAction &&
    currentInput.hookType;

  // キャプション生成ハンドラ
  const handleGenerate = useCallback(async () => {
    if (!isValid) {
      toast.error("全ての項目を入力してください");
      return;
    }

    setIsGenerating(true);
    onBeforeGenerate?.();

    // キーワードをカンマ区切りでパース
    const keywords = keywordsText
      .split(/[,、，\s]+/)
      .map((k) => k.trim())
      .filter(Boolean);

    const input: CaptionInput = {
      genre: currentInput.genre as Genre,
      theme: currentInput.theme!.trim(),
      keywords,
      targetAction: currentInput.targetAction as TargetAction,
      hookType: currentInput.hookType as HookType,
      includeEmoji: currentInput.includeEmoji ?? true,
    };

    try {
      if (generationMode === "ai") {
        // AI生成モード: APIエンドポイントを呼び出す
        const captions = await generateWithAI(input);
        for (const caption of captions) {
          addCaption(caption);
        }
        onGenerated(captions);
        toast.success("AIが3つのバリエーションを生成しました");
      } else {
        // テンプレート生成モード: 既存のローカル生成を使用
        // 生成処理に少し遅延を入れてUI体験を向上
        await new Promise((resolve) => setTimeout(resolve, 800));
        const captions = generateCaptionVariants(input, 3);
        for (const caption of captions) {
          addCaption(caption);
        }
        onGenerated(captions);
        toast.success("3つのバリエーションを生成しました");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "生成に失敗しました";
      toast.error(message);

      // AI生成失敗時はテンプレート生成にフォールバック
      if (generationMode === "ai") {
        toast.info("テンプレート生成にフォールバックします...");
        await new Promise((resolve) => setTimeout(resolve, 500));
        const captions = generateCaptionVariants(input, 3);
        for (const caption of captions) {
          addCaption(caption);
        }
        onGenerated(captions);
        toast.success("テンプレートで3つのバリエーションを生成しました");
      }
    }

    setIsGenerating(false);
  }, [
    currentInput,
    keywordsText,
    isValid,
    addCaption,
    onGenerated,
    onBeforeGenerate,
    generationMode,
  ]);

  return (
    <div className="space-y-6">
      {/* 生成モード切替トグル */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-muted-foreground">
          生成モード
        </Label>
        <div
          className="grid grid-cols-2 gap-2"
          role="radiogroup"
          aria-label="生成モードを選択"
        >
          {/* テンプレートモード */}
          <button
            type="button"
            role="radio"
            aria-checked={generationMode === "template"}
            aria-label="テンプレート生成: ローカルで高速にキャプションを生成"
            onClick={() => handleModeChange("template")}
            className={cn(
              "relative flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
              "border bg-card/80 dark:bg-zinc-900/50 hover:bg-muted/70",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
              generationMode === "template"
                ? "border-transparent bg-muted/80 shadow-lg shadow-purple-900/20"
                : "border-border/50 hover:border-border"
            )}
          >
            {/* 選択時のグラデーションボーダー */}
            {generationMode === "template" && (
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
            <Sparkles
              className={cn(
                "size-4",
                generationMode === "template"
                  ? "text-purple-400"
                  : "text-muted-foreground"
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                generationMode === "template"
                  ? "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                  : "text-muted-foreground"
              )}
            >
              テンプレート
            </span>
          </button>

          {/* AI生成モード */}
          <button
            type="button"
            role="radio"
            aria-checked={generationMode === "ai"}
            aria-label="AI生成: GPTを使用して高品質なキャプションを生成"
            onClick={() => handleModeChange("ai")}
            className={cn(
              "relative flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
              "border bg-card/80 dark:bg-zinc-900/50 hover:bg-muted/70",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
              generationMode === "ai"
                ? "border-transparent bg-muted/80 shadow-lg shadow-purple-900/20"
                : "border-border/50 hover:border-border"
            )}
          >
            {/* 選択時のグラデーションボーダー */}
            {generationMode === "ai" && (
              <span
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{
                  padding: '2px',
                  background: 'linear-gradient(135deg, #10b981, #06b6d4, #3b82f6)',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                }}
                aria-hidden="true"
              />
            )}
            <Wand2
              className={cn(
                "size-4",
                generationMode === "ai"
                  ? "text-emerald-400"
                  : "text-muted-foreground"
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                generationMode === "ai"
                  ? "bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
                  : "text-muted-foreground"
              )}
            >
              AI生成
            </span>
            {/* GPTバッジ */}
            <span
              className={cn(
                "ml-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-wide text-white",
                "bg-gradient-to-r from-emerald-500 to-cyan-500"
              )}
              aria-hidden="true"
            >
              GPT
            </span>
          </button>
        </div>
      </div>

      {/* ジャンル選択 */}
      <div className="space-y-2">
        <Label htmlFor="genre" className="text-sm font-medium text-muted-foreground">
          ジャンル
        </Label>
        <Select
          value={currentInput.genre ?? ""}
          onValueChange={(value) =>
            setCurrentInput({ genre: value as Genre })
          }
        >
          <SelectTrigger
            id="genre"
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
      <div className="space-y-2">
        <Label htmlFor="theme" className="text-sm font-medium text-muted-foreground">
          テーマ
        </Label>
        <Input
          id="theme"
          placeholder="例: 朝のルーティン、ダイエット成功の秘訣..."
          value={currentInput.theme ?? ""}
          onChange={(e) => setCurrentInput({ theme: e.target.value })}
          className="bg-card/80 dark:bg-zinc-900/50 border-border/50 hover:border-border focus-visible:border-purple-500 transition-colors"
          aria-label="テーマを入力"
        />
      </div>

      {/* キーワード入力 */}
      <div className="space-y-2">
        <Label
          htmlFor="keywords"
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
            id="keywords"
            placeholder="例: 時短, 簡単, 初心者"
            value={keywordsText}
            onChange={(e) => setKeywordsText(e.target.value)}
            className="pl-9 bg-card/80 dark:bg-zinc-900/50 border-border/50 hover:border-border focus-visible:border-purple-500 transition-colors"
            aria-label="キーワードを入力"
          />
        </div>
      </div>

      {/* ターゲットアクション選択 */}
      <div className="space-y-2">
        <Label
          htmlFor="target-action"
          className="text-sm font-medium text-muted-foreground"
        >
          狙うアクション
        </Label>
        <Select
          value={currentInput.targetAction ?? ""}
          onValueChange={(value) =>
            setCurrentInput({ targetAction: value as TargetAction })
          }
        >
          <SelectTrigger
            id="target-action"
            className="w-full bg-card/80 dark:bg-zinc-900/50 border-border/50 hover:border-border transition-colors"
            aria-label="ターゲットアクションを選択"
          >
            <SelectValue placeholder="狙うアクションを選択..." />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {(
              Object.entries(targetActionDisplayNames) as [
                TargetAction,
                string,
              ][]
            ).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                <span className="flex items-center gap-2">
                  {targetActionIcons[value]}
                  {label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* フックタイプ選択（カードグリッド） */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-muted-foreground">
          フックタイプ
        </Label>
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          role="radiogroup"
          aria-label="フックタイプを選択"
        >
          {hookTypeCards.map((hook) => {
            const isSelected = currentInput.hookType === hook.value;
            return (
              <button
                key={hook.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${hook.label}: ${hook.description}`}
                onClick={() => setCurrentInput({ hookType: hook.value })}
                className={cn(
                  "relative flex flex-col items-start gap-1.5 rounded-xl p-3.5 text-left transition-all duration-200",
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
                <span className="text-lg leading-none" aria-hidden="true">
                  {hook.emoji}
                </span>
                <span
                  className={cn(
                    "text-sm font-semibold leading-tight",
                    isSelected
                      ? "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                      : "text-foreground"
                  )}
                >
                  {hook.label}
                </span>
                <span className="text-[11px] leading-snug text-muted-foreground">
                  {hook.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 絵文字トグル */}
      <div className="flex items-center gap-3 rounded-lg bg-card/60 dark:bg-zinc-900/30 px-4 py-3">
        <Checkbox
          id="emoji-toggle"
          checked={currentInput.includeEmoji ?? true}
          onCheckedChange={(checked) =>
            setCurrentInput({ includeEmoji: checked === true })
          }
          className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
          aria-label="絵文字を含める"
        />
        <Label
          htmlFor="emoji-toggle"
          className="cursor-pointer text-sm text-muted-foreground"
        >
          絵文字を含める
        </Label>
      </div>

      {/* 生成ボタン */}
      <Button
        onClick={handleGenerate}
        disabled={!isValid || isGenerating}
        className={cn(
          "w-full h-12 rounded-xl text-base font-bold tracking-wide transition-all duration-300",
          generationMode === "ai"
            ? "bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 hover:shadow-lg hover:shadow-emerald-900/30"
            : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:shadow-purple-900/30",
          "active:scale-[0.98]",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
        )}
        aria-label="キャプションを生成する"
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
              {generationMode === "ai"
                ? "GPTが生成中..."
                : "3つのバリエーションを生成中..."}
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
              {generationMode === "ai" ? (
                <Wand2 className="size-5" aria-hidden="true" />
              ) : (
                <Sparkles className="size-5" aria-hidden="true" />
              )}
              {generationMode === "ai"
                ? "AIで生成する (3案)"
                : "生成する (3案)"}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
}
