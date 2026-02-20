"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Copy,
  ChevronDown,
  Star,
  ArrowUpDown,
  Sparkles,
  Brain,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Genre } from "@/lib/types";
import {
  captionTemplates,
  templateCategories,
  genreLabels,
  type CaptionTemplate,
  type TemplateCategory,
} from "@/data/captionTemplates";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

/** ソートオプション */
type SortOption = "popularity-desc" | "popularity-asc" | "default";

/**
 * テンプレートライブラリのメインコンポーネント
 * フィルター、検索、ソート機能付きのテンプレートカード一覧
 */
export function TemplateLibrary() {
  // フィルター状態
  const [selectedGenre, setSelectedGenre] = useState<Genre | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<
    TemplateCategory | "all"
  >("all");
  const [sortOption, setSortOption] = useState<SortOption>("popularity-desc");
  const [searchQuery, setSearchQuery] = useState("");

  // 展開中のテンプレートID
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // トピック入力（テンプレート別）
  const [topicInputs, setTopicInputs] = useState<Record<string, string>>({});

  // フィルタリングとソート
  const filteredTemplates = useMemo(() => {
    let result = [...captionTemplates];

    // ジャンルフィルター
    if (selectedGenre !== "all") {
      result = result.filter((t) => t.genre === selectedGenre);
    }

    // カテゴリフィルター
    if (selectedCategory !== "all") {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // 検索フィルター
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.hook.toLowerCase().includes(query) ||
          t.body.toLowerCase().includes(query) ||
          t.psychologyNote.toLowerCase().includes(query)
      );
    }

    // ソート
    switch (sortOption) {
      case "popularity-desc":
        result.sort((a, b) => b.popularity - a.popularity);
        break;
      case "popularity-asc":
        result.sort((a, b) => a.popularity - b.popularity);
        break;
      default:
        break;
    }

    return result;
  }, [selectedGenre, selectedCategory, sortOption, searchQuery]);

  // テンプレート展開トグル
  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  // トピック入力変更
  const handleTopicChange = useCallback((id: string, value: string) => {
    setTopicInputs((prev) => ({ ...prev, [id]: value }));
  }, []);

  // テンプレートのテキスト置換
  const replaceTopicInText = (text: string, topic: string): string => {
    if (!topic.trim()) return text;
    return text.replace(/{topic}/g, topic);
  };

  // テンプレートをクリップボードにコピー
  const handleCopy = useCallback(
    (template: CaptionTemplate) => {
      const topic = topicInputs[template.id] || "{topic}";
      const fullText = [
        replaceTopicInText(template.hook, topic),
        "",
        replaceTopicInText(template.body, topic),
        "",
        template.cta,
        "",
        template.hashtags.join(" "),
      ].join("\n");

      navigator.clipboard.writeText(fullText).then(() => {
        toast.success("テンプレートをコピーしました");
      });
    },
    [topicInputs]
  );

  // 人気度の星表示
  const renderStars = (popularity: number) => {
    return (
      <div className="flex items-center gap-0.5" aria-label={`人気度: ${popularity}/5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              "size-3.5",
              i < popularity
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* フィルターエリア */}
      <Card className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {/* ジャンルセレクト */}
            <div className="flex-1 space-y-1.5">
              <label
                htmlFor="genre-filter"
                className="text-xs font-medium text-muted-foreground"
              >
                ジャンル
              </label>
              <Select
                value={selectedGenre}
                onValueChange={(v) => setSelectedGenre(v as Genre | "all")}
              >
                <SelectTrigger
                  id="genre-filter"
                  className="bg-card/80 dark:bg-zinc-900/50 border-border/50 hover:border-border transition-colors"
                  aria-label="ジャンルでフィルター"
                >
                  <SelectValue placeholder="全てのジャンル" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">全てのジャンル</SelectItem>
                  {(Object.entries(genreLabels) as [Genre, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* ソートセレクト */}
            <div className="flex-1 space-y-1.5">
              <label
                htmlFor="sort-option"
                className="text-xs font-medium text-muted-foreground"
              >
                並び替え
              </label>
              <Select
                value={sortOption}
                onValueChange={(v) => setSortOption(v as SortOption)}
              >
                <SelectTrigger
                  id="sort-option"
                  className="bg-card/80 dark:bg-zinc-900/50 border-border/50 hover:border-border transition-colors"
                  aria-label="並び替え"
                >
                  <ArrowUpDown className="size-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="popularity-desc">人気度: 高い順</SelectItem>
                  <SelectItem value="popularity-asc">人気度: 低い順</SelectItem>
                  <SelectItem value="default">デフォルト</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 検索 */}
            <div className="flex-1 space-y-1.5">
              <label
                htmlFor="search-templates"
                className="text-xs font-medium text-muted-foreground"
              >
                キーワード検索
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="search-templates"
                  placeholder="テンプレートを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card/80 dark:bg-zinc-900/50 border-border/50 hover:border-border focus-visible:border-purple-500 transition-colors"
                  aria-label="テンプレートを検索"
                />
              </div>
            </div>
          </div>

          {/* カテゴリタブ */}
          <div className="mt-4">
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="カテゴリフィルター"
            >
              <button
                role="tab"
                aria-selected={selectedCategory === "all"}
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
                  selectedCategory === "all"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/20"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                すべて
              </button>
              {templateCategories.map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/20"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 結果件数 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredTemplates.length}件のテンプレート
        </p>
      </div>

      {/* テンプレートカード一覧 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredTemplates.map((template) => {
            const isExpanded = expandedId === template.id;
            const topic = topicInputs[template.id] || "";

            return (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={cn(
                    "border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm transition-all duration-200",
                    "hover:border-border hover:bg-card dark:hover:bg-zinc-900/60",
                    isExpanded && "ring-1 ring-purple-500/30"
                  )}
                >
                  {/* カードヘッダー（常に表示） */}
                  <button
                    type="button"
                    onClick={() => handleToggleExpand(template.id)}
                    className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-500/50 rounded-t-xl"
                    aria-expanded={isExpanded}
                    aria-controls={`template-content-${template.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1.5 min-w-0">
                          <CardTitle className="text-sm font-semibold text-foreground leading-tight">
                            {template.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className="border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] px-2 py-0"
                            >
                              {genreLabels[template.genre]}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="border-pink-500/30 bg-pink-500/10 text-pink-300 text-[10px] px-2 py-0"
                            >
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {renderStars(template.popularity)}
                          <ChevronDown
                            className={cn(
                              "size-4 text-muted-foreground transition-transform duration-200",
                              isExpanded && "rotate-180"
                            )}
                          />
                        </div>
                      </div>
                    </CardHeader>

                    {/* フック文プレビュー */}
                    <CardContent className="pt-0 pb-3">
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {template.hook}
                      </p>
                    </CardContent>
                  </button>

                  {/* 行動科学メモ（常に表示） */}
                  <div className="px-6 pb-4">
                    <div className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2">
                      <Brain
                        className="size-3.5 text-amber-400 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {template.psychologyNote}
                      </p>
                    </div>
                  </div>

                  {/* 展開コンテンツ */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        id={`template-content-${template.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 space-y-4">
                          <Separator className="bg-border" />

                          {/* トピック入力 */}
                          <div className="space-y-1.5">
                            <label
                              htmlFor={`topic-${template.id}`}
                              className="text-xs font-medium text-muted-foreground"
                            >
                              トピック（{"{topic}"}を置換）
                            </label>
                            <Input
                              id={`topic-${template.id}`}
                              placeholder="例: 朝のストレッチ"
                              value={topic}
                              onChange={(e) =>
                                handleTopicChange(template.id, e.target.value)
                              }
                              className="bg-card/80 dark:bg-zinc-900/50 border-border/50 hover:border-border focus-visible:border-purple-500 transition-colors text-sm"
                              aria-label="トピックを入力してテンプレートをカスタマイズ"
                            />
                          </div>

                          {/* フル内容プレビュー */}
                          <ScrollArea className="max-h-64">
                            <div className="space-y-3 pr-3">
                              {/* フック */}
                              <div className="space-y-1">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-400">
                                  フック
                                </p>
                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                  {replaceTopicInText(template.hook, topic)}
                                </p>
                              </div>

                              {/* 本文 */}
                              <div className="space-y-1">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-pink-400">
                                  本文
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                  {replaceTopicInText(template.body, topic)}
                                </p>
                              </div>

                              {/* CTA */}
                              <div className="space-y-1">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-400">
                                  CTA
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {template.cta}
                                </p>
                              </div>

                              {/* ハッシュタグ */}
                              <div className="space-y-1">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                                  ハッシュタグ
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {template.hashtags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="outline"
                                      className="border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-[10px]"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </ScrollArea>

                          {/* アクションボタン */}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleCopy(template)}
                              variant="outline"
                              size="sm"
                              className="flex-1 border-border bg-muted/50 text-foreground hover:bg-muted hover:text-foreground"
                              aria-label="テンプレートをコピー"
                            >
                              <Copy className="size-3.5 mr-1.5" />
                              コピー
                            </Button>
                            <Button
                              asChild
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500"
                            >
                              <Link href="/caption" aria-label="キャプション生成へ移動">
                                <Sparkles className="size-3.5 mr-1.5" />
                                キャプション生成へ
                                <ExternalLink className="size-3 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 結果なし */}
      {filteredTemplates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Search className="size-10 mb-3 text-muted-foreground" />
          <p className="text-sm font-medium">
            条件に合うテンプレートが見つかりませんでした
          </p>
          <p className="text-xs mt-1">フィルターを変更してみてください</p>
        </div>
      )}
    </div>
  );
}
