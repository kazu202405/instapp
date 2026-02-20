"use client";

import { useMemo } from "react";
import { Sparkles, BarChart3, UserCircle, FlaskConical } from "lucide-react";
import { useCaptionStore } from "@/store/captionStore";
import { useAnalysisStore } from "@/store/analysisStore";
import { useProfileStore } from "@/store/profileStore";
import { useABTestStore } from "@/store/abtestStore";
import { calculateProfileScore } from "@/engine/profile/checker";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { useCountUp } from "@/hooks/useCountUp";

/**
 * 数値のカウントアップアニメーション表示コンポーネント
 * 数値として解析可能な値のみアニメーションし、"-"等はそのまま表示
 */
function AnimatedValue({ value }: { value: string }) {
  const num = parseInt(value, 10);
  const animated = useCountUp(isNaN(num) ? 0 : num);
  if (isNaN(num) || value === "-") return <>{value}</>;
  return <>{animated}</>;
}

// 統計項目定義
interface StatConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  getValue: () => string;
  gradientFrom: string;
  gradientTo: string;
  iconBg: string;
}

export function QuickStats() {
  const { captions } = useCaptionStore();
  const { posts, results } = useAnalysisStore();
  const { checkItems } = useProfileStore();
  const { tests } = useABTestStore();

  // 平均スコア計算
  const avgScore = useMemo(() => {
    const resultValues = Object.values(results);
    if (resultValues.length === 0) return 0;
    const total = resultValues.reduce((sum, r) => sum + r.overallScore, 0);
    return Math.round(total / resultValues.length);
  }, [results]);

  // プロフィールスコア
  const profileScore = useMemo(
    () => calculateProfileScore(checkItems),
    [checkItems]
  );

  // 進行中テスト数
  const activeTestCount = useMemo(
    () => tests.filter((t) => t.status === "active").length,
    [tests]
  );

  const stats: StatConfig[] = [
    {
      label: "生成キャプション数",
      icon: Sparkles,
      getValue: () => String(captions.length),
      gradientFrom: "from-purple-600",
      gradientTo: "to-purple-400",
      iconBg: "bg-purple-600/20",
    },
    {
      label: "平均スコア",
      icon: BarChart3,
      getValue: () => (Object.keys(results).length > 0 ? String(avgScore) : "-"),
      gradientFrom: "from-pink-600",
      gradientTo: "to-pink-400",
      iconBg: "bg-pink-600/20",
    },
    {
      label: "プロフィールスコア",
      icon: UserCircle,
      getValue: () => String(profileScore),
      gradientFrom: "from-orange-600",
      gradientTo: "to-orange-400",
      iconBg: "bg-orange-600/20",
    },
    {
      label: "進行中テスト",
      icon: FlaskConical,
      getValue: () => String(activeTestCount),
      gradientFrom: "from-blue-600",
      gradientTo: "to-blue-400",
      iconBg: "bg-blue-600/20",
    },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      role="region"
      aria-label="クイック統計"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        const value = stat.getValue();

        return (
          <Card
            key={stat.label}
            className="border-border bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm card-hover"
          >
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground leading-tight">
                    {stat.label}
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold tabular-nums bg-gradient-to-r bg-clip-text text-transparent",
                      stat.gradientFrom,
                      stat.gradientTo
                    )}
                  >
                    <AnimatedValue value={value} />
                  </p>
                </div>
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg",
                    stat.iconBg
                  )}
                  aria-hidden="true"
                >
                  <Icon
                    className={cn(
                      "size-4 bg-gradient-to-r bg-clip-text",
                      stat.gradientFrom === "from-purple-600" && "text-purple-400",
                      stat.gradientFrom === "from-pink-600" && "text-pink-400",
                      stat.gradientFrom === "from-orange-600" && "text-orange-400",
                      stat.gradientFrom === "from-blue-600" && "text-blue-400"
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
