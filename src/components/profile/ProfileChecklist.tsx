"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Search,
  FileText,
  MousePointerClick,
  Camera,
  Star,
  Pin,
  ChevronDown,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { getProfileCheckItems, calculateProfileScore, getCategoryScores } from "@/engine/profile/checker";
import { useProfileStore } from "@/store/profileStore";
import { cn } from "@/lib/utils";
import type { ProfileCheckItem } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// カテゴリ定義
const CATEGORIES = [
  { key: "name" as const, label: "名前SEO", icon: Search },
  { key: "bio" as const, label: "バイオ", icon: FileText },
  { key: "cta" as const, label: "CTA", icon: MousePointerClick },
  { key: "photo" as const, label: "写真", icon: Camera },
  { key: "highlights" as const, label: "ハイライト", icon: Star },
  { key: "pinned" as const, label: "固定投稿", icon: Pin },
] as const;

// スコアに応じた色クラスを返す
function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

// スコアに応じたプログレスバー色クラスを返す
function getProgressColor(score: number): string {
  if (score >= 80) return "[&>[data-slot=progress-indicator]]:bg-emerald-500";
  if (score >= 60) return "[&>[data-slot=progress-indicator]]:bg-yellow-500";
  if (score >= 40) return "[&>[data-slot=progress-indicator]]:bg-orange-500";
  return "[&>[data-slot=progress-indicator]]:bg-red-500";
}

// 円形プログレスコンポーネント
function CircularProgress({
  score,
  size = 160,
}: {
  score: number;
  size?: number;
}) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // スコアに応じたグラデーション色
  const gradientId = "score-gradient";

  return (
    <div className="relative inline-flex items-center justify-center" role="img" aria-label={`プロフィールスコア: ${score}点`}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        {/* 背景トラック */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {/* プログレスアーク */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* 中央スコア表示 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-4xl font-bold tabular-nums", getScoreColor(score))}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

export function ProfileChecklist() {
  const { checkItems, setCheckItems, toggleItem, resetAll } = useProfileStore();
  // 前回のスコアを保持してパーフェクトスコア達成を検知
  const prevScoreRef = useRef(0);

  // トースト付きトグルハンドラ
  const handleToggle = useCallback(
    (id: string) => {
      const item = checkItems.find((i) => i.id === id);
      const wasCompleted = item?.completed ?? false;
      toggleItem(id);
      // チェックを入れた時のみトースト表示
      if (!wasCompleted && item) {
        toast.success(`${item.label}を達成!`);
      }
    },
    [checkItems, toggleItem]
  );

  // 開閉状態をカテゴリキーで管理
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    name: true,
    bio: true,
    cta: true,
    photo: true,
    highlights: true,
    pinned: true,
  });

  // ストアが空の場合、エンジンからチェック項目を初期化
  useEffect(() => {
    if (checkItems.length === 0) {
      const items = getProfileCheckItems();
      setCheckItems(items);
    }
  }, [checkItems.length, setCheckItems]);

  // 全体スコア計算
  const overallScore = useMemo(
    () => calculateProfileScore(checkItems),
    [checkItems]
  );

  // スコアが100に到達した時のトースト
  useEffect(() => {
    if (overallScore === 100 && prevScoreRef.current < 100 && prevScoreRef.current > 0) {
      toast.success("パーフェクトスコア!");
    }
    prevScoreRef.current = overallScore;
  }, [overallScore]);

  // カテゴリ別スコア計算
  const categoryScores = useMemo(
    () => getCategoryScores(checkItems),
    [checkItems]
  );

  // カテゴリ別に項目をグループ化
  const groupedItems = useMemo(() => {
    const groups: Record<string, ProfileCheckItem[]> = {};
    for (const item of checkItems) {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    }
    return groups;
  }, [checkItems]);

  // カテゴリの開閉トグル
  const toggleCategory = (key: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 完了項目数
  const completedCount = checkItems.filter((item) => item.completed).length;
  const totalCount = checkItems.length;

  return (
    <div className="space-y-6">
      {/* 全体スコア表示カード */}
      <Card className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
            {/* 円形プログレス */}
            <div className="shrink-0">
              <CircularProgress score={overallScore} />
            </div>

            {/* スコア詳細 */}
            <div className="flex-1 space-y-4 w-full">
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold text-foreground">
                  プロフィールスコア
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {completedCount} / {totalCount} 項目完了
                </p>
              </div>

              {/* カテゴリ別ミニプログレス */}
              <div className="space-y-2.5">
                {CATEGORIES.map((cat) => {
                  const catScore = categoryScores[cat.key];
                  if (!catScore) return null;
                  const Icon = cat.icon;
                  return (
                    <div key={cat.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Icon className="size-3" aria-hidden="true" />
                          {cat.label}
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          {catScore.completed}/{catScore.total}
                        </span>
                      </div>
                      <Progress
                        value={catScore.score}
                        className={cn("h-1.5", getProgressColor(catScore.score))}
                        aria-label={`${cat.label}: ${catScore.score}%`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* リセットボタン */}
              <button
                onClick={resetAll}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                aria-label="全項目をリセットする"
              >
                全てリセット
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* カテゴリ別チェックリスト */}
      <TooltipProvider>
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const items = groupedItems[cat.key] ?? [];
            const catScore = categoryScores[cat.key];
            const isOpen = openCategories[cat.key] ?? true;
            const Icon = cat.icon;

            return (
              <Card
                key={cat.key}
                className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm overflow-hidden"
              >
                {/* カテゴリヘッダー（折りたたみトグル） */}
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.key)}
                  className={cn(
                    "flex w-full items-center justify-between px-6 py-4 text-left transition-colors",
                    "hover:bg-muted/60",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-inset"
                  )}
                  aria-expanded={isOpen}
                  aria-controls={`category-${cat.key}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg",
                        catScore && catScore.score === 100
                          ? "bg-emerald-600/20"
                          : "bg-gradient-to-br from-purple-600/20 to-pink-600/20"
                      )}
                      aria-hidden="true"
                    >
                      <Icon
                        className={cn(
                          "size-4",
                          catScore && catScore.score === 100
                            ? "text-emerald-400"
                            : "text-pink-400"
                        )}
                      />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        {cat.label}
                      </span>
                      {catScore && (
                        <span className={cn("ml-2 text-xs tabular-nums", getScoreColor(catScore.score))}>
                          {catScore.score}%
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "size-4 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </button>

                {/* チェック項目リスト */}
                <div
                  id={`category-${cat.key}`}
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  )}
                  role="region"
                  aria-label={`${cat.label}のチェックリスト`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-4 space-y-1">
                      {items.map((item) => (
                        <ChecklistItem
                          key={item.id}
                          item={item}
                          onToggle={handleToggle}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}

// 個別チェック項目コンポーネント
function ChecklistItem({
  item,
  onToggle,
  onChecked,
}: {
  item: ProfileCheckItem;
  onToggle: (id: string) => void;
  onChecked?: (label: string) => void;
}) {
  const [showReason, setShowReason] = useState(false);

  return (
    <div
      className={cn(
        "group rounded-lg p-3 transition-colors",
        item.completed
          ? "bg-emerald-950/20"
          : "hover:bg-muted/50"
      )}
    >
      <div className="flex items-start gap-3">
        {/* チェックボックス */}
        <Checkbox
          id={`check-${item.id}`}
          checked={item.completed}
          onCheckedChange={() => onToggle(item.id)}
          className={cn(
            "mt-0.5 shrink-0",
            "data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          )}
          aria-label={item.label}
        />

        {/* ラベルと説明 */}
        <div className="flex-1 min-w-0">
          <label
            htmlFor={`check-${item.id}`}
            className={cn(
              "block text-sm font-medium cursor-pointer transition-colors",
              item.completed
                ? "text-muted-foreground line-through"
                : "text-foreground"
            )}
          >
            {item.label}
          </label>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {item.description}
          </p>

          {/* 「なぜ？」トグルボタン */}
          <button
            type="button"
            onClick={() => setShowReason(!showReason)}
            className={cn(
              "mt-1.5 inline-flex items-center gap-1 text-xs transition-colors",
              "text-purple-400/70 hover:text-purple-400",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500/50 rounded"
            )}
            aria-expanded={showReason}
          >
            <Info className="size-3" aria-hidden="true" />
            <span>{showReason ? "閉じる" : "なぜ？"}</span>
          </button>

          {/* 心理学的理由の展開エリア */}
          <div
            className={cn(
              "grid transition-all duration-200 ease-in-out",
              showReason
                ? "grid-rows-[1fr] opacity-100 mt-2"
                : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <div className="rounded-md bg-purple-950/30 border border-purple-800/20 px-3 py-2">
                <p className="text-xs text-purple-300/80 leading-relaxed">
                  {item.psychologyReason}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
