"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  ArrowRightLeft,
  BarChart3,
  Brain,
  Trash2,
  CheckCircle2,
  Clock,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { useABTestStore } from "@/store/abtestStore";
import { showUndoToast } from "@/lib/undoToast";
import { evaluateTest } from "@/engine/abtest/hypothesis";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type { ABTest } from "@/lib/types";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TestTrackerProps {
  filter: "active" | "completed";
}

export function TestTracker({ filter }: TestTrackerProps) {
  const { tests, completeTest, removeTest, addTest } = useABTestStore();

  // Undoトースト付きの削除ハンドラ
  const handleRemoveTest = useCallback(
    (id: string) => {
      const deletedTest = tests.find((t) => t.id === id);
      removeTest(id);
      showUndoToast("テストを削除しました", () => {
        if (deletedTest) {
          addTest(deletedTest);
        }
      });
    },
    [tests, removeTest, addTest]
  );

  const filteredTests = useMemo(
    () => tests.filter((test) => test.status === filter),
    [tests, filter]
  );

  if (filteredTests.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        {filter === "active" ? (
          <>
            <Clock className="size-10 text-muted-foreground mb-3" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              進行中のテストはありません
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              テンプレートタブからテストを作成してください
            </p>
          </>
        ) : (
          <>
            <CheckCircle2 className="size-10 text-muted-foreground mb-3" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              完了したテストはありません
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              テスト結果を記録すると、ここに表示されます
            </p>
          </>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-4" role="list" aria-label={`${filter === "active" ? "進行中" : "完了"}のテスト一覧`}>
      {filteredTests.map((test) =>
        filter === "active" ? (
          <ActiveTestCard
            key={test.id}
            test={test}
            onComplete={completeTest}
            onRemove={handleRemoveTest}
          />
        ) : (
          <CompletedTestCard
            key={test.id}
            test={test}
            onRemove={handleRemoveTest}
          />
        )
      )}
    </div>
  );
}

// 進行中テストカード
function ActiveTestCard({
  test,
  onComplete,
  onRemove,
}: {
  test: ABTest;
  onComplete: (
    id: string,
    resultA: number,
    resultB: number,
    winner: "A" | "B" | null,
    learning: string
  ) => void;
  onRemove: (id: string) => void;
}) {
  const [resultA, setResultA] = useState("");
  const [resultB, setResultB] = useState("");
  const [learning, setLearning] = useState("");

  const handleComplete = useCallback(() => {
    const numA = parseFloat(resultA) || 0;
    const numB = parseFloat(resultB) || 0;

    // evaluateTestを使って勝者を判定
    const tempTest: ABTest = {
      ...test,
      resultA: numA,
      resultB: numB,
    };
    const evaluation = evaluateTest(tempTest);

    onComplete(test.id, numA, numB, evaluation.winner, learning.trim());
    toast.success("テスト結果を記録しました");
  }, [test, resultA, resultB, learning, onComplete]);

  const canSubmit = resultA.trim() !== "" && resultB.trim() !== "";

  return (
    <Card
      className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm"
      role="listitem"
    >
      <CardContent className="pt-5 space-y-4">
        {/* ヘッダー: 心理原理 + 削除ボタン */}
        <div className="flex items-start justify-between gap-2">
          <Badge
            variant="secondary"
            className="bg-purple-900/40 text-purple-300 border-purple-700/30"
          >
            <Brain className="size-3 mr-1" aria-hidden="true" />
            {test.psychologyPrinciple}
          </Badge>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onRemove(test.id)}
            className="text-muted-foreground hover:text-red-400"
            aria-label="テストを削除"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>

        {/* 仮説 */}
        <p className="text-sm font-medium text-foreground leading-relaxed">
          {test.hypothesis}
        </p>

        {/* A vs B */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-blue-950/20 border border-blue-800/20 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="flex size-5 items-center justify-center rounded bg-blue-600/30 text-[10px] font-bold text-blue-300">
                A
              </span>
              <span className="text-xs font-medium text-blue-300">A案</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              {test.variableA}
            </p>
            <div className="space-y-1">
              <Label htmlFor={`result-a-${test.id}`} className="text-xs text-muted-foreground">
                結果値
              </Label>
              <Input
                id={`result-a-${test.id}`}
                type="number"
                step="0.01"
                placeholder="0.00"
                value={resultA}
                onChange={(e) => setResultA(e.target.value)}
                className="h-8 bg-card/80 dark:bg-zinc-900/50 border-border/50 text-sm"
              />
            </div>
          </div>

          <div className="rounded-lg bg-orange-950/20 border border-orange-800/20 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="flex size-5 items-center justify-center rounded bg-orange-600/30 text-[10px] font-bold text-orange-300">
                B
              </span>
              <span className="text-xs font-medium text-orange-300">B案</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              {test.variableB}
            </p>
            <div className="space-y-1">
              <Label htmlFor={`result-b-${test.id}`} className="text-xs text-muted-foreground">
                結果値
              </Label>
              <Input
                id={`result-b-${test.id}`}
                type="number"
                step="0.01"
                placeholder="0.00"
                value={resultB}
                onChange={(e) => setResultB(e.target.value)}
                className="h-8 bg-card/80 dark:bg-zinc-900/50 border-border/50 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 指標 */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <BarChart3 className="size-3" aria-hidden="true" />
          <span>指標: {test.metric}</span>
        </div>

        {/* 学びの記録 */}
        <div className="space-y-1.5">
          <Label htmlFor={`learning-${test.id}`} className="text-xs text-muted-foreground">
            学びの記録（任意）
          </Label>
          <Textarea
            id={`learning-${test.id}`}
            placeholder="テストから得た気づきや学びを記録..."
            value={learning}
            onChange={(e) => setLearning(e.target.value)}
            className="bg-card/80 dark:bg-zinc-900/50 border-border/50 min-h-16 text-sm"
          />
        </div>

        {/* 結果記録ボタン */}
        <Button
          onClick={handleComplete}
          disabled={!canSubmit}
          className={cn(
            "w-full bg-gradient-to-r from-purple-600 to-pink-600",
            "hover:from-purple-500 hover:to-pink-500",
            "disabled:opacity-40"
          )}
        >
          <CheckCircle2 className="size-4" aria-hidden="true" />
          結果を記録
        </Button>

        {/* 作成日 */}
        <p className="text-[10px] text-muted-foreground text-right">
          作成: {formatDate(test.createdAt, "yyyy/MM/dd HH:mm")}
        </p>
      </CardContent>
    </Card>
  );
}

// 完了テストカード
function CompletedTestCard({
  test,
  onRemove,
}: {
  test: ABTest;
  onRemove: (id: string) => void;
}) {
  const evaluation = evaluateTest(test);

  return (
    <Card
      className={cn(
        "border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm",
        evaluation.winner === "A" && "border-l-2 border-l-blue-500",
        evaluation.winner === "B" && "border-l-2 border-l-orange-500",
        evaluation.winner === null && "border-l-2 border-l-zinc-500"
      )}
      role="listitem"
    >
      <CardContent className="pt-5 space-y-4">
        {/* ヘッダー: 結果 + 削除 */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className="bg-purple-900/40 text-purple-300 border-purple-700/30"
            >
              <Brain className="size-3 mr-1" aria-hidden="true" />
              {test.psychologyPrinciple}
            </Badge>
            {/* 勝者バッジ */}
            {evaluation.winner === "A" && (
              <Badge className="bg-blue-600/30 text-blue-300 border-blue-700/30">
                <Trophy className="size-3 mr-1" aria-hidden="true" />
                A案 勝利
              </Badge>
            )}
            {evaluation.winner === "B" && (
              <Badge className="bg-orange-600/30 text-orange-300 border-orange-700/30">
                <Trophy className="size-3 mr-1" aria-hidden="true" />
                B案 勝利
              </Badge>
            )}
            {evaluation.winner === null && (
              <Badge variant="outline" className="text-muted-foreground border-border">
                <Minus className="size-3 mr-1" aria-hidden="true" />
                引き分け
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onRemove(test.id)}
            className="text-muted-foreground hover:text-red-400"
            aria-label="テストを削除"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>

        {/* 仮説 */}
        <p className="text-sm font-medium text-foreground leading-relaxed">
          {test.hypothesis}
        </p>

        {/* 結果比較 */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className={cn(
              "rounded-lg p-3 text-center",
              evaluation.winner === "A"
                ? "bg-blue-950/30 border border-blue-700/30"
                : "bg-muted/30"
            )}
          >
            <span className="block text-[10px] text-muted-foreground mb-1">A案</span>
            <span
              className={cn(
                "block text-lg font-bold tabular-nums",
                evaluation.winner === "A" ? "text-blue-300" : "text-muted-foreground"
              )}
            >
              {test.resultA ?? "-"}
            </span>
          </div>
          <div
            className={cn(
              "rounded-lg p-3 text-center",
              evaluation.winner === "B"
                ? "bg-orange-950/30 border border-orange-700/30"
                : "bg-muted/30"
            )}
          >
            <span className="block text-[10px] text-muted-foreground mb-1">B案</span>
            <span
              className={cn(
                "block text-lg font-bold tabular-nums",
                evaluation.winner === "B" ? "text-orange-300" : "text-muted-foreground"
              )}
            >
              {test.resultB ?? "-"}
            </span>
          </div>
        </div>

        {/* 信頼度 */}
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-muted-foreground">信頼度:</span>{" "}
          {evaluation.confidence}
        </div>

        {/* 洞察 */}
        <div className="rounded-lg bg-purple-950/20 border border-purple-800/20 p-3">
          <p className="text-xs text-purple-300/80 leading-relaxed">
            {evaluation.insight}
          </p>
        </div>

        {/* 学びの記録 */}
        {test.learning && (
          <div className="rounded-lg bg-muted/30 p-3">
            <span className="block text-[10px] text-muted-foreground mb-1">
              学びの記録
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {test.learning}
            </p>
          </div>
        )}

        {/* 完了日 */}
        <p className="text-[10px] text-muted-foreground text-right">
          完了: {test.completedAt ? formatDate(test.completedAt, "yyyy/MM/dd HH:mm") : "-"}
        </p>
      </CardContent>
    </Card>
  );
}
