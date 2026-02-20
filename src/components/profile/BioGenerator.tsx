"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Sparkles,
  Copy,
  Check,
  Brain,
  ChevronDown,
  User,
  Target,
  Lightbulb,
  MessageSquare,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/lib/utils";
import type { Genre } from "@/lib/types";
import {
  generateBioVariants,
  type BioInput,
  type GeneratedBio,
} from "@/engine/profile/bioGenerator";
import type { BioTone, BioCTAType } from "@/data/bioTemplates";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================================
// 定数
// ============================================================

const BIO_CHAR_LIMIT = 150;

const GENRE_OPTIONS: { value: Genre; label: string }[] = [
  { value: "fitness", label: "フィットネス" },
  { value: "food", label: "料理・グルメ" },
  { value: "travel", label: "旅行" },
  { value: "beauty", label: "美容" },
  { value: "business", label: "ビジネス" },
  { value: "lifestyle", label: "ライフスタイル" },
  { value: "tech", label: "テック" },
  { value: "education", label: "教育・学び" },
  { value: "fashion", label: "ファッション" },
  { value: "photography", label: "写真" },
];

const TONE_OPTIONS: { value: BioTone; label: string; icon: string }[] = [
  { value: "プロフェッショナル", label: "プロフェッショナル", icon: "💼" },
  { value: "フレンドリー", label: "フレンドリー", icon: "😊" },
  { value: "インスピレーション", label: "インスピレーション", icon: "✨" },
  { value: "ユーモア", label: "ユーモア", icon: "😄" },
];

const CTA_OPTIONS: { value: BioCTAType; label: string }[] = [
  { value: "リンク誘導", label: "リンク誘導" },
  { value: "DM誘導", label: "DM誘導" },
  { value: "フォロー訴求", label: "フォロー訴求" },
];

// ============================================================
// メインコンポーネント
// ============================================================

export function BioGenerator() {
  // フォーム状態
  const [genre, setGenre] = useState<Genre>("lifestyle");
  const [name, setName] = useState("");
  const [usp, setUsp] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState<BioTone>("フレンドリー");
  const [includeCta, setIncludeCta] = useState(true);
  const [ctaType, setCtaType] = useState<BioCTAType>("フォロー訴求");

  // 生成結果
  const [variants, setVariants] = useState<GeneratedBio[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // バリデーション
  const isValid = name.trim() !== "" && usp.trim() !== "" && targetAudience.trim() !== "";

  // 生成処理
  const handleGenerate = useCallback(() => {
    if (!isValid) {
      toast.error("名前、USP、ターゲット層を入力してください");
      return;
    }

    setIsGenerating(true);

    // 視覚的なフィードバックのための短い遅延
    setTimeout(() => {
      const input: BioInput = {
        genre,
        name: name.trim(),
        usp: usp.trim(),
        targetAudience: targetAudience.trim(),
        tone,
        includeCta,
        ctaType: includeCta ? ctaType : undefined,
      };

      const results = generateBioVariants(input, 3);
      setVariants(results);
      setIsGenerating(false);
      toast.success("3つのバリエーションを生成しました");
    }, 400);
  }, [genre, name, usp, targetAudience, tone, includeCta, ctaType, isValid]);

  return (
    <div className="space-y-6">
      {/* 入力フォーム */}
      <Card className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <div
              className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20"
              aria-hidden="true"
            >
              <Sparkles className="size-4 text-pink-400" />
            </div>
            バイオ生成
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* ジャンル選択 */}
          <div className="space-y-2">
            <Label htmlFor="bio-genre" className="text-muted-foreground text-sm">
              ジャンル
            </Label>
            <Select
              value={genre}
              onValueChange={(v) => setGenre(v as Genre)}
            >
              <SelectTrigger id="bio-genre" className="w-full bg-card/80 dark:bg-zinc-900/60 border-border">
                <SelectValue placeholder="ジャンルを選択" />
              </SelectTrigger>
              <SelectContent>
                {GENRE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 名前 */}
          <div className="space-y-2">
            <Label htmlFor="bio-name" className="text-muted-foreground text-sm flex items-center gap-1.5">
              <User className="size-3.5" aria-hidden="true" />
              アカウント名 / ニックネーム
            </Label>
            <Input
              id="bio-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: たろう"
              className="bg-card/80 dark:bg-zinc-900/60 border-border"
              maxLength={30}
            />
          </div>

          {/* USP */}
          <div className="space-y-2">
            <Label htmlFor="bio-usp" className="text-muted-foreground text-sm flex items-center gap-1.5">
              <Lightbulb className="size-3.5" aria-hidden="true" />
              独自の強み（USP）
            </Label>
            <Input
              id="bio-usp"
              value={usp}
              onChange={(e) => setUsp(e.target.value)}
              placeholder="例: 時短レシピ、筋トレ初心者向けメニュー"
              className="bg-card/80 dark:bg-zinc-900/60 border-border"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              あなたが他と違うポイントを簡潔に
            </p>
          </div>

          {/* ターゲット層 */}
          <div className="space-y-2">
            <Label htmlFor="bio-target" className="text-muted-foreground text-sm flex items-center gap-1.5">
              <Target className="size-3.5" aria-hidden="true" />
              ターゲット層
            </Label>
            <Input
              id="bio-target"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="例: 30代の働くママ、筋トレ初心者"
              className="bg-card/80 dark:bg-zinc-900/60 border-border"
              maxLength={40}
            />
          </div>

          {/* トーン選択 */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm flex items-center gap-1.5">
              <MessageSquare className="size-3.5" aria-hidden="true" />
              トーン
            </Label>
            <div
              className="grid grid-cols-2 gap-2"
              role="radiogroup"
              aria-label="トーンを選択"
            >
              {TONE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={tone === opt.value}
                  onClick={() => setTone(opt.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
                    tone === opt.value
                      ? "border-purple-500/60 bg-purple-950/30 text-purple-200"
                      : "border-border/40 bg-card/80 dark:bg-zinc-900/40 text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  <span aria-hidden="true">{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CTA設定 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={includeCta}
                onClick={() => setIncludeCta(!includeCta)}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  includeCta ? "bg-purple-600" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block size-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
                    includeCta ? "translate-x-4" : "translate-x-0"
                  )}
                />
              </button>
              <Label className="text-muted-foreground text-sm cursor-pointer" onClick={() => setIncludeCta(!includeCta)}>
                CTAを含める
              </Label>
            </div>

            <AnimatePresence>
              {includeCta && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <Select
                    value={ctaType}
                    onValueChange={(v) => setCtaType(v as BioCTAType)}
                  >
                    <SelectTrigger className="w-full bg-card/80 dark:bg-zinc-900/60 border-border">
                      <SelectValue placeholder="CTA種別を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {CTA_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 生成ボタン */}
          <Button
            onClick={handleGenerate}
            disabled={!isValid || isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold"
            size="lg"
          >
            {isGenerating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="size-4" />
              </motion.div>
            ) : (
              <Sparkles className="size-4" />
            )}
            {isGenerating ? "生成中..." : "3つのバリエーションを生成"}
          </Button>
        </CardContent>
      </Card>

      {/* 生成結果 */}
      <AnimatePresence mode="wait">
        {variants.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              生成結果
            </h3>
            {variants.map((bio, index) => (
              <motion.div
                key={bio.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <BioVariantCard bio={bio} index={index} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// バリエーションカードコンポーネント
// ============================================================

function BioVariantCard({
  bio,
  index,
}: {
  bio: GeneratedBio;
  index: number;
}) {
  const [copied, setCopied] = useState(false);
  const [showNote, setShowNote] = useState(false);

  // 文字数に応じたプログレスバー色
  const charRatio = bio.characterCount / BIO_CHAR_LIMIT;
  const progressColor =
    charRatio > 0.95
      ? "[&>[data-slot=progress-indicator]]:bg-red-500"
      : charRatio > 0.8
        ? "[&>[data-slot=progress-indicator]]:bg-yellow-500"
        : "[&>[data-slot=progress-indicator]]:bg-emerald-500";

  // コピー処理
  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(bio.text);
    if (success) {
      setCopied(true);
      toast.success("バイオをコピーしました");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("コピーに失敗しました");
    }
  }, [bio.text]);

  // パターンラベルの色
  const patternColors = [
    "bg-blue-500/20 text-blue-300 border-blue-500/30",
    "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    "bg-amber-500/20 text-amber-300 border-amber-500/30",
  ];

  return (
    <Card className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm">
      <CardContent className="pt-5 space-y-4">
        {/* ヘッダー: パターン名とコピーボタン */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
              patternColors[index % patternColors.length]
            )}
          >
            {bio.patternName}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-muted-foreground hover:text-foreground"
            aria-label="バイオテキストをコピー"
          >
            {copied ? (
              <Check className="size-4 text-emerald-400" />
            ) : (
              <Copy className="size-4" />
            )}
            <span className="ml-1 text-xs">
              {copied ? "コピー済" : "コピー"}
            </span>
          </Button>
        </div>

        {/* バイオテキスト */}
        <div className="rounded-lg bg-background/60 dark:bg-zinc-950/60 border border-border/30 p-4">
          <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
            {bio.text}
          </p>
        </div>

        {/* 文字数カウンター */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">文字数</span>
            <span
              className={cn(
                "tabular-nums font-medium",
                charRatio > 0.95
                  ? "text-red-400"
                  : charRatio > 0.8
                    ? "text-yellow-400"
                    : "text-emerald-400"
              )}
            >
              {bio.characterCount} / {BIO_CHAR_LIMIT}
            </span>
          </div>
          <Progress
            value={Math.min((bio.characterCount / BIO_CHAR_LIMIT) * 100, 100)}
            className={cn("h-1.5", progressColor)}
            aria-label={`文字数: ${bio.characterCount}/${BIO_CHAR_LIMIT}`}
          />
        </div>

        {/* 行動科学ノート */}
        <div>
          <button
            type="button"
            onClick={() => setShowNote(!showNote)}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs transition-colors",
              "text-purple-400/70 hover:text-purple-400",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500/50 rounded"
            )}
            aria-expanded={showNote}
          >
            <Brain className="size-3" aria-hidden="true" />
            <span>{showNote ? "ノートを閉じる" : "行動科学ノート"}</span>
            <ChevronDown
              className={cn(
                "size-3 transition-transform duration-200",
                showNote && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>

          <div
            className={cn(
              "grid transition-all duration-200 ease-in-out",
              showNote
                ? "grid-rows-[1fr] opacity-100 mt-2"
                : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <div className="rounded-md bg-purple-950/30 border border-purple-800/20 px-3 py-2.5">
                <p className="text-xs text-purple-300/80 leading-relaxed whitespace-pre-line">
                  {bio.psychologyNote}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
