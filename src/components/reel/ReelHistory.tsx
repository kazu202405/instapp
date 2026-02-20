"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Trash2,
  Clock,
  Film,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { ReelScript } from "@/engine/reel/generator";
import { useReelStore } from "@/store/reelStore";
import { showUndoToast } from "@/lib/undoToast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReelHistoryProps {
  onSelect: (script: ReelScript) => void;
  selectedId?: string;
}

/**
 * リール台本の生成履歴コンポーネント
 * 過去の台本をリスト表示し、クリックで詳細を再表示
 */
export function ReelHistory({ onSelect, selectedId }: ReelHistoryProps) {
  const { scripts, removeScript, addScript, clearHistory } = useReelStore();
  const [isOpen, setIsOpen] = useState(true);

  // Undoトースト付きの全履歴クリアハンドラ
  const handleClearHistory = useCallback(() => {
    const allScripts = [...scripts];
    clearHistory();
    showUndoToast("全履歴をクリアしました", () => {
      for (const script of allScripts) {
        addScript(script);
      }
    });
  }, [scripts, clearHistory, addScript]);

  if (scripts.length === 0) {
    return (
      <Card className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <History className="size-8 mb-2 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium">まだ履歴がありません</p>
            <p className="text-xs mt-1 text-muted-foreground">
              台本を生成するとここに表示されます
            </p>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  // スタイルのバッジ色
  const getStyleColor = (style: string) => {
    switch (style) {
      case "教育":
        return "border-blue-500/30 bg-blue-500/10 text-blue-300";
      case "ストーリー":
        return "border-purple-500/30 bg-purple-500/10 text-purple-300";
      case "ビフォーアフター":
        return "border-green-500/30 bg-green-500/10 text-green-300";
      case "リスト":
        return "border-amber-500/30 bg-amber-500/10 text-amber-300";
      case "チュートリアル":
        return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
      default:
        return "border-zinc-500/30 bg-zinc-500/10 text-muted-foreground";
    }
  };

  return (
    <Card className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 rounded"
            aria-expanded={isOpen}
          >
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
              <History className="size-4" aria-hidden="true" />
              生成履歴
              <Badge
                variant="outline"
                className="border-border bg-muted/50 text-muted-foreground text-[10px] ml-1"
              >
                {scripts.length}件
              </Badge>
            </CardTitle>
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>
          {scripts.length > 0 && (
            <Button
              onClick={handleClearHistory}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 text-xs"
              aria-label="全履歴をクリア"
            >
              <Trash2 className="size-3.5 mr-1" />
              クリア
            </Button>
          )}
        </div>
      </CardHeader>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <CardContent className="pt-2">
              <ScrollArea className="max-h-80">
                <div className="space-y-2 pr-2">
                  {scripts.map((script) => {
                    const isSelected = selectedId === script.id;
                    const createdDate = new Date(script.createdAt);

                    return (
                      <motion.button
                        key={script.id}
                        type="button"
                        onClick={() => onSelect(script)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "w-full text-left rounded-lg p-3 transition-all duration-200",
                          "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
                          isSelected
                            ? "border-purple-500/30 bg-purple-500/5"
                            : "border-border bg-card/60 dark:bg-zinc-900/30 hover:bg-muted/60 hover:border-border"
                        )}
                        aria-label={`${script.input.theme}の台本を表示`}
                        aria-current={isSelected ? "true" : undefined}
                      >
                        {/* テーマ */}
                        <p className="text-sm font-medium text-foreground truncate mb-1.5">
                          {script.input.theme}
                        </p>

                        {/* メタ情報 */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] px-1.5 py-0", getStyleColor(script.input.style))}
                          >
                            {script.input.style}
                          </Badge>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Film className="size-3" aria-hidden="true" />
                            {script.totalDuration}秒
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="size-3" aria-hidden="true" />
                            {format(createdDate, "M/d HH:mm", { locale: ja })}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
