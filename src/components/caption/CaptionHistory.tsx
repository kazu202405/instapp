"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Clock, FileText, AlertCircle, Download, Star } from "lucide-react";
import { toast } from "sonner";
import type { GeneratedCaption, Genre } from "@/lib/types";
import { useCaptionStore } from "@/store/captionStore";
import { showUndoToast } from "@/lib/undoToast";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { exportAsCSV, captionsToCSVData } from "@/lib/exportData";

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

// ジャンルごとの色クラス
const genreBadgeColors: Record<Genre, string> = {
  fitness: "bg-green-500/15 text-green-400 border-green-500/25",
  food: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  travel: "bg-sky-500/15 text-sky-400 border-sky-500/25",
  beauty: "bg-pink-500/15 text-pink-400 border-pink-500/25",
  business: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  lifestyle: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  tech: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  education: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  fashion: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/25",
  photography: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
};

interface CaptionHistoryProps {
  onSelect: (caption: GeneratedCaption) => void;
  selectedId?: string;
}

export function CaptionHistory({ onSelect, selectedId }: CaptionHistoryProps) {
  const { captions, removeCaption, addCaption, clearHistory, favorites, toggleFavorite } = useCaptionStore();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // お気に入りフィルター適用済みキャプション一覧
  const filteredCaptions = useMemo(() => {
    if (!showFavoritesOnly) return captions;
    return captions.filter((c) => favorites.includes(c.id));
  }, [captions, favorites, showFavoritesOnly]);

  // フック文の最初の1行を取得（プレビュー用）
  const getPreviewText = useCallback((text: string): string => {
    // 絵文字プレフィクスを含めて最初の行を取得
    const firstLine = text.split("\n")[0] ?? "";
    if (firstLine.length > 50) {
      return firstLine.slice(0, 50) + "...";
    }
    return firstLine;
  }, []);

  // 削除ハンドラ（Undoトースト付き）
  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const deletedCaption = captions.find((c) => c.id === id);
      removeCaption(id);
      showUndoToast("キャプションを削除しました", () => {
        if (deletedCaption) {
          addCaption(deletedCaption);
        }
      });
    },
    [captions, removeCaption, addCaption]
  );

  // 全履歴クリアハンドラ（Undoトースト付き）
  const handleClearHistory = useCallback(() => {
    const allCaptions = [...captions];
    clearHistory();
    showUndoToast("全履歴をクリアしました", () => {
      for (const caption of allCaptions) {
        addCaption(caption);
      }
    });
  }, [captions, clearHistory, addCaption]);

  // お気に入りトグルハンドラ
  const handleToggleFavorite = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      toggleFavorite(id);
    },
    [toggleFavorite]
  );

  // CSVエクスポートハンドラ
  const handleExportCSV = useCallback(() => {
    if (captions.length === 0) {
      toast.warning("エクスポートするキャプションがありません");
      return;
    }
    try {
      const csvData = captionsToCSVData(captions);
      const timestamp = new Date().toISOString().slice(0, 10);
      exportAsCSV(csvData, `instagrowth-captions-${timestamp}`);
      toast.success("エクスポートしました");
    } catch {
      toast.error("エクスポートに失敗しました");
    }
  }, [captions]);

  // 空状態
  if (captions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center justify-center gap-3 py-12 text-center"
      >
        <div className="rounded-full bg-muted/60 p-4" aria-hidden="true">
          <FileText className="size-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            まだキャプションが生成されていません
          </p>
          <p className="text-xs text-muted-foreground/60">
            左側のフォームからキャプションを生成してみましょう
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm font-medium text-muted-foreground">
            履歴
            <span className="ml-1.5 text-xs text-muted-foreground/60">
              ({captions.length}件)
            </span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={handleExportCSV}
            className="text-xs text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10"
            aria-label="キャプション履歴をCSVでエクスポート"
          >
            <Download className="size-3" aria-hidden="true" />
            CSV
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={handleClearHistory}
            className="text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
            aria-label="全ての履歴をクリア"
          >
            <AlertCircle className="size-3" aria-hidden="true" />
            履歴をクリア
          </Button>
        </div>
      </div>

      {/* お気に入りフィルター */}
      <div className="flex items-center gap-2 px-1 pb-2">
        <button
          type="button"
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
            showFavoritesOnly
              ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
              : "bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted/80"
          )}
          aria-label={showFavoritesOnly ? "全てのキャプションを表示" : "お気に入りのみ表示"}
          aria-pressed={showFavoritesOnly}
        >
          <Star className={cn("size-3", showFavoritesOnly && "fill-yellow-400")} aria-hidden="true" />
          お気に入り
          {favorites.length > 0 && (
            <span className="text-[10px] text-muted-foreground/60">({favorites.length})</span>
          )}
        </button>
      </div>

      <Separator className="bg-border/80 mb-2" />

      {/* 履歴リスト */}
      <ScrollArea className="flex-1 -mx-1 pr-1">
        <ul className="space-y-1.5 pb-2" role="list" aria-label="キャプション履歴">
          {filteredCaptions.length === 0 && showFavoritesOnly ? (
            <li className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Star className="size-5 text-muted-foreground/40" aria-hidden="true" />
              <p className="text-xs text-muted-foreground/60">
                お気に入りのキャプションがありません
              </p>
            </li>
          ) : (
            filteredCaptions.map((caption) => {
              const isSelected = caption.id === selectedId;
              const isFav = favorites.includes(caption.id);
              const genre = caption.input.genre;
              return (
                <li key={caption.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(caption)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(caption); } }}
                    className={cn(
                      "group relative flex w-full flex-col gap-2 rounded-lg px-3 py-2.5 text-left transition-all duration-150 cursor-pointer",
                      "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
                      isSelected
                        ? "bg-muted/80 border border-purple-500/30"
                        : "border border-transparent"
                    )}
                    aria-label={`キャプション: ${getPreviewText(caption.hook)}`}
                    aria-current={isSelected ? "true" : undefined}
                  >
                    {/* プレビューテキスト */}
                    <p
                      className={cn(
                        "text-sm leading-snug line-clamp-2 pr-14",
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {getPreviewText(caption.hook)}
                    </p>

                    {/* メタ情報 */}
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0 font-normal",
                          genreBadgeColors[genre]
                        )}
                      >
                        {genreDisplayNames[genre]}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground/60">
                        {formatDate(caption.createdAt, "M/d HH:mm")}
                      </span>
                    </div>

                    {/* アクションボタン（ホバー時に表示） */}
                    <div className="absolute right-2 top-2 flex items-center gap-0.5">
                      {/* お気に入りボタン */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(e, caption.id)}
                        className={cn(
                          "rounded-md p-1 transition-all",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/50",
                          isFav
                            ? "text-yellow-400 opacity-100"
                            : "text-muted-foreground/60 hover:text-yellow-400 hover:bg-yellow-500/10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
                        )}
                        aria-label={isFav ? "お気に入りを解除" : "お気に入りに追加"}
                        aria-pressed={isFav}
                      >
                        <Star className={cn("size-3.5", isFav && "fill-yellow-400")} aria-hidden="true" />
                      </button>

                      {/* 削除ボタン */}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, caption.id)}
                        className={cn(
                          "rounded-md p-1 transition-all",
                          "text-muted-foreground/60 hover:text-red-400 hover:bg-red-500/10",
                          "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
                          "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                        )}
                        aria-label={`このキャプションを削除`}
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </ScrollArea>
    </div>
  );
}
