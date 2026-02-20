"use client";

import { Bookmark, Users, Clock, Hash, Film, UserCircle } from "lucide-react";

// クイック質問の定義
const quickQuestions = [
  {
    label: "保存を増やすには？",
    question:
      "Instagramで投稿の保存数を増やすための具体的な戦略を教えてください。行動科学の原理を使って説明してください。",
    icon: Bookmark,
  },
  {
    label: "フォロワー1000人突破",
    question:
      "フォロワー0から1000人を達成するためのロードマップを教えてください。ナノアカウントのベンチマークも踏まえて。",
    icon: Users,
  },
  {
    label: "最適な投稿時間",
    question:
      "Instagramの最適な投稿時間と頻度について教えてください。曜日別のおすすめも知りたいです。",
    icon: Clock,
  },
  {
    label: "ハッシュタグ戦略",
    question:
      "効果的なハッシュタグ戦略を教えてください。3層構造（ビッグ・ミドル・ニッチ）の使い分け方を具体的に。",
    icon: Hash,
  },
  {
    label: "リールのコツ",
    question:
      "リールでバズるためのコツを教えてください。フック、構成、尺の最適化について知りたいです。",
    icon: Film,
  },
  {
    label: "プロフィール改善",
    question:
      "Instagramのプロフィールを最適化するポイントを教えてください。フォロー転換率を上げるコツを行動科学の観点から。",
    icon: UserCircle,
  },
];

interface QuickQuestionsProps {
  onSelect: (question: string) => void;
}

export function QuickQuestions({ onSelect }: QuickQuestionsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 px-4 sm:grid-cols-3">
      {quickQuestions.map((q) => {
        const Icon = q.icon;
        return (
          <button
            key={q.label}
            type="button"
            onClick={() => onSelect(q.question)}
            className="flex items-center gap-2 rounded-xl border border-border bg-card/50 px-3 py-2.5 text-left text-sm text-muted-foreground transition-all duration-200 hover:border-pink-500/50 hover:bg-card hover:text-foreground"
          >
            <Icon className="h-4 w-4 shrink-0 text-pink-400" />
            <span className="truncate">{q.label}</span>
          </button>
        );
      })}
    </div>
  );
}
