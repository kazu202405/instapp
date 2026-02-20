"use client";

import { useState, useCallback } from "react";
import {
  FlaskConical,
  Plus,
  ArrowRightLeft,
  BarChart3,
  Brain,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getHypothesisTemplates,
  createABTest,
} from "@/engine/abtest/hypothesis";
import type { HypothesisTemplate } from "@/engine/abtest/hypothesis";
import { useABTestStore } from "@/store/abtestStore";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function HypothesisBuilder() {
  const templates = getHypothesisTemplates();
  const { addTest } = useABTestStore();
  const [showCustomForm, setShowCustomForm] = useState(false);

  // カスタムフォーム状態
  const [customHypothesis, setCustomHypothesis] = useState("");
  const [customPrinciple, setCustomPrinciple] = useState("");
  const [customVariableA, setCustomVariableA] = useState("");
  const [customVariableB, setCustomVariableB] = useState("");
  const [customMetric, setCustomMetric] = useState("");

  // テンプレートからテスト作成
  const handleCreateFromTemplate = useCallback(
    (template: HypothesisTemplate) => {
      const test = createABTest(template.id);
      addTest(test);
      toast.success("A/Bテストを作成しました");
    },
    [addTest]
  );

  // カスタムテスト作成
  const handleCreateCustom = useCallback(() => {
    if (!customHypothesis.trim()) return;

    const test = createABTest("custom", {
      hypothesis: customHypothesis.trim(),
      psychologyPrinciple: customPrinciple.trim() || "カスタム",
      variableA: customVariableA.trim() || "A案",
      variableB: customVariableB.trim() || "B案",
      metric: customMetric.trim() || "エンゲージメント率",
    });
    addTest(test);
    toast.success("A/Bテストを作成しました");

    // フォームリセット
    setCustomHypothesis("");
    setCustomPrinciple("");
    setCustomVariableA("");
    setCustomVariableB("");
    setCustomMetric("");
    setShowCustomForm(false);
  }, [
    customHypothesis,
    customPrinciple,
    customVariableA,
    customVariableB,
    customMetric,
    addTest,
  ]);

  const isCustomValid = customHypothesis.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* カスタムテスト作成ボタン */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCustomForm(!showCustomForm)}
          className="border-border/50 hover:border-purple-500/50"
        >
          {showCustomForm ? (
            <>
              <X className="size-4" aria-hidden="true" />
              閉じる
            </>
          ) : (
            <>
              <Plus className="size-4" aria-hidden="true" />
              カスタムテスト作成
            </>
          )}
        </Button>
      </div>

      {/* カスタムテスト作成フォーム */}
      {showCustomForm && (
        <Card className="border-purple-800/30 bg-purple-950/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              カスタムA/Bテスト作成
            </CardTitle>
            <CardDescription>
              独自の仮説でテストを設計します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-hypothesis" className="text-sm text-muted-foreground">
                仮説 <span className="text-pink-400">*</span>
              </Label>
              <Textarea
                id="custom-hypothesis"
                placeholder="例: 質問型のフックは直接型よりもエンゲージメントが高い"
                value={customHypothesis}
                onChange={(e) => setCustomHypothesis(e.target.value)}
                className="bg-card/80 dark:bg-zinc-900/50 border-border/50 min-h-20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-principle" className="text-sm text-muted-foreground">
                心理原理（任意）
              </Label>
              <Input
                id="custom-principle"
                placeholder="例: 好奇心ギャップ"
                value={customPrinciple}
                onChange={(e) => setCustomPrinciple(e.target.value)}
                className="bg-card/80 dark:bg-zinc-900/50 border-border/50"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="custom-variable-a" className="text-sm text-muted-foreground">
                  A案
                </Label>
                <Input
                  id="custom-variable-a"
                  placeholder="例: 質問型フック"
                  value={customVariableA}
                  onChange={(e) => setCustomVariableA(e.target.value)}
                  className="bg-card/80 dark:bg-zinc-900/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-variable-b" className="text-sm text-muted-foreground">
                  B案
                </Label>
                <Input
                  id="custom-variable-b"
                  placeholder="例: 直接型フック"
                  value={customVariableB}
                  onChange={(e) => setCustomVariableB(e.target.value)}
                  className="bg-card/80 dark:bg-zinc-900/50 border-border/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-metric" className="text-sm text-muted-foreground">
                測定指標
              </Label>
              <Input
                id="custom-metric"
                placeholder="例: エンゲージメント率"
                value={customMetric}
                onChange={(e) => setCustomMetric(e.target.value)}
                className="bg-card/80 dark:bg-zinc-900/50 border-border/50"
              />
            </div>

            <Button
              onClick={handleCreateCustom}
              disabled={!isCustomValid}
              className={cn(
                "w-full bg-gradient-to-r from-purple-600 to-pink-600",
                "hover:from-purple-500 hover:to-pink-500",
                "disabled:opacity-40"
              )}
            >
              <FlaskConical className="size-4" aria-hidden="true" />
              テストを作成
            </Button>
          </CardContent>
        </Card>
      )}

      {/* テンプレートグリッド */}
      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        role="list"
        aria-label="仮説テンプレート一覧"
      >
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onCreate={handleCreateFromTemplate}
          />
        ))}
      </div>
    </div>
  );
}

// テンプレートカードコンポーネント
function TemplateCard({
  template,
  onCreate,
}: {
  template: HypothesisTemplate;
  onCreate: (template: HypothesisTemplate) => void;
}) {
  return (
    <Card
      className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm transition-colors hover:border-border/80"
      role="listitem"
    >
      <CardContent className="pt-5 space-y-3">
        {/* 心理原理バッジ */}
        <Badge
          variant="secondary"
          className="bg-purple-900/40 text-purple-300 border-purple-700/30"
        >
          <Brain className="size-3 mr-1" aria-hidden="true" />
          {template.principle}
        </Badge>

        {/* 仮説テキスト */}
        <p className="text-sm font-medium text-foreground leading-relaxed">
          {template.hypothesis}
        </p>

        {/* A vs B 比較 */}
        <div className="space-y-2 rounded-lg bg-muted/30 p-3">
          <div className="flex items-start gap-2">
            <span className="shrink-0 mt-0.5 flex size-5 items-center justify-center rounded bg-blue-600/30 text-[10px] font-bold text-blue-300">
              A
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {template.variableA}
            </p>
          </div>
          <div className="flex items-center justify-center">
            <ArrowRightLeft className="size-3 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="flex items-start gap-2">
            <span className="shrink-0 mt-0.5 flex size-5 items-center justify-center rounded bg-orange-600/30 text-[10px] font-bold text-orange-300">
              B
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {template.variableB}
            </p>
          </div>
        </div>

        {/* 測定指標 */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <BarChart3 className="size-3" aria-hidden="true" />
          <span>指標: {template.metric}</span>
        </div>

        {/* テスト作成ボタン */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCreate(template)}
          className="w-full border-border/50 hover:border-purple-500/50 hover:bg-purple-950/30"
        >
          <FlaskConical className="size-3.5" aria-hidden="true" />
          テスト作成
        </Button>
      </CardContent>
    </Card>
  );
}
