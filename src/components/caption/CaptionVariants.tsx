"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  ChevronDown,
  Brain,
  Lightbulb,
  BookOpen,
  Gift,
  MousePointerClick,
  CheckCircle2,
} from "lucide-react";
import type { GeneratedCaption } from "@/lib/types";
import { cn, copyToClipboard } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScheduleModal } from "@/components/caption/ScheduleModal";

// タブの色設定
const tabColors = [
  {
    label: "案1",
    accent: "purple",
    gradient: "from-purple-600 to-purple-400",
    border: "border-purple-500",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    ring: "ring-purple-500/30",
    activeBg: "bg-purple-500/20",
    buttonGradient: "from-purple-600 to-purple-500",
  },
  {
    label: "案2",
    accent: "pink",
    gradient: "from-pink-600 to-pink-400",
    border: "border-pink-500",
    bg: "bg-pink-500/10",
    text: "text-pink-400",
    ring: "ring-pink-500/30",
    activeBg: "bg-pink-500/20",
    buttonGradient: "from-pink-600 to-pink-500",
  },
  {
    label: "案3",
    accent: "orange",
    gradient: "from-orange-600 to-orange-400",
    border: "border-orange-500",
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    ring: "ring-orange-500/30",
    activeBg: "bg-orange-500/20",
    buttonGradient: "from-orange-600 to-orange-500",
  },
];

// キャプションの各セクション定義
const sectionConfig = [
  {
    key: "hook" as const,
    label: "フック",
    icon: Lightbulb,
    badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  {
    key: "story" as const,
    label: "ストーリー",
    icon: BookOpen,
    badgeClass: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  },
  {
    key: "value" as const,
    label: "価値提供",
    icon: Gift,
    badgeClass: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  },
  {
    key: "cta" as const,
    label: "CTA",
    icon: MousePointerClick,
    badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
];

interface CaptionVariantsProps {
  variants: GeneratedCaption[];
  onSelect: (caption: GeneratedCaption) => void;
  selectedId?: string;
}

export function CaptionVariants({
  variants,
  onSelect,
  selectedId,
}: CaptionVariantsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reasonExpanded, setReasonExpanded] = useState(false);

  // クリップボードにコピー
  const handleCopy = useCallback(
    async (caption: GeneratedCaption) => {
      const success = await copyToClipboard(caption.fullCaption);
      if (success) {
        setCopiedId(caption.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    },
    []
  );

  if (variants.length === 0) return null;

  const activeCaption = variants[activeTab];
  const activeColor = tabColors[activeTab] ?? tabColors[0];
  const isSelected = selectedId === activeCaption?.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      role="region"
      aria-label="生成されたキャプションバリエーション"
    >
      <div className="rounded-2xl border border-border/50 bg-card/80 dark:bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
        {/* グラデーションアクセント上部 */}
        <div
          className="h-1 w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500"
          aria-hidden="true"
        />

        {/* タブヘッダー */}
        <div className="flex items-center border-b border-border px-4 pt-4 pb-0">
          <div
            className="flex gap-1"
            role="tablist"
            aria-label="キャプションバリエーション"
          >
            {variants.map((variant, index) => {
              const color = tabColors[index] ?? tabColors[0];
              const isActive = activeTab === index;
              const isThisSelected = selectedId === variant.id;
              const charCount = variant.fullCaption.length;

              return (
                <button
                  key={variant.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`variant-panel-${index}`}
                  id={`variant-tab-${index}`}
                  onClick={() => {
                    setActiveTab(index);
                    setReasonExpanded(false);
                  }}
                  className={cn(
                    "relative flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
                    isActive
                      ? `${color.activeBg} ${color.text} border-b-2 ${color.border}`
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border-b-2 border-transparent"
                  )}
                >
                  {isThisSelected && (
                    <CheckCircle2
                      className="size-3.5 text-emerald-400"
                      aria-label="採用済み"
                    />
                  )}
                  <span>{color.label}</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full",
                      isActive
                        ? `${color.bg} ${color.text}`
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {charCount}文字
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* タブコンテンツ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            id={`variant-panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`variant-tab-${activeTab}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="p-4 space-y-4"
          >
            {/* アクションバー */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isSelected ? (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 gap-1">
                    <CheckCircle2 className="size-3" aria-hidden="true" />
                    採用済み
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => onSelect(activeCaption)}
                    className={cn(
                      "gap-1.5 rounded-lg text-sm font-semibold text-white",
                      `bg-gradient-to-r ${activeColor.buttonGradient}`,
                      "hover:opacity-90 active:scale-[0.98] transition-all"
                    )}
                    aria-label={`${activeColor.label}を採用する`}
                  >
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    この案を採用
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ScheduleModal
                  hookLine={activeCaption.hook}
                  theme={activeCaption.input.theme}
                  genre={activeCaption.input.genre}
                  hookType={activeCaption.input.hookType}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(activeCaption)}
                  className={cn(
                    "gap-1.5 border-border transition-all duration-200",
                    copiedId === activeCaption.id
                      ? "bg-emerald-900/50 border-emerald-600/50 text-emerald-300"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  aria-label={
                    copiedId === activeCaption.id
                      ? "コピーしました"
                      : "キャプションをコピー"
                  }
                >
                  {copiedId === activeCaption.id ? (
                    <>
                      <Check className="size-3.5" aria-hidden="true" />
                      コピー済み
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" aria-hidden="true" />
                      コピー
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* 4幕構造の各セクション */}
            <div className="space-y-3">
              {sectionConfig.map((section) => {
                const Icon = section.icon;
                const text = activeCaption[section.key];
                return (
                  <div key={section.key} className="space-y-1.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "gap-1 text-[11px] font-semibold",
                        section.badgeClass
                      )}
                    >
                      <Icon className="size-3" aria-hidden="true" />
                      {section.label}
                    </Badge>
                    <p className="text-sm leading-relaxed text-foreground pl-1 whitespace-pre-wrap">
                      {text}
                    </p>
                  </div>
                );
              })}
            </div>

            <Separator className="bg-border/50" />

            {/* ハッシュタグ表示 */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">ハッシュタグ</p>
              <div
                className="flex flex-wrap gap-1.5"
                role="list"
                aria-label="生成されたハッシュタグ"
              >
                {activeCaption.hashtags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-muted text-purple-300 border border-border/50 text-xs font-normal hover:bg-muted/80 transition-colors cursor-default"
                    role="listitem"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* 行動科学的理由（アコーディオン） */}
            <div className="rounded-lg border border-border/40 bg-muted/30 overflow-hidden">
              <button
                type="button"
                onClick={() => setReasonExpanded(!reasonExpanded)}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-3 text-left transition-colors",
                  "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-inset"
                )}
                aria-expanded={reasonExpanded}
                aria-controls={`reason-content-${activeTab}`}
              >
                <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Brain
                    className="size-4 text-purple-400"
                    aria-hidden="true"
                  />
                  なぜこのフック？
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform duration-200",
                    reasonExpanded && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence>
                {reasonExpanded && (
                  <motion.div
                    id={`reason-content-${activeTab}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                    role="region"
                    aria-label="行動科学的な理由の詳細"
                  >
                    <div className="space-y-4 px-4 pb-4">
                      {/* フック理由 */}
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                          <Lightbulb
                            className="size-3"
                            aria-hidden="true"
                          />
                          フック選択の心理学
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {activeCaption.hookReason}
                        </p>
                      </div>

                      {/* CTA理由 */}
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                          <MousePointerClick
                            className="size-3"
                            aria-hidden="true"
                          />
                          CTA設計の心理学
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {activeCaption.ctaReason}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
