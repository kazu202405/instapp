"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send } from "lucide-react";
import type { PostMetrics, PostFormat, ContentPillar } from "@/lib/types";
import { calculateScore } from "@/engine/analyzer/scorer";
import { useAnalysisStore } from "@/store/analysisStore";

/** 投稿フォーマット選択肢 */
const FORMAT_OPTIONS: { value: PostFormat; label: string }[] = [
  { value: "reel", label: "リール" },
  { value: "carousel", label: "カルーセル" },
  { value: "image", label: "画像" },
  { value: "story", label: "ストーリーズ" },
];

/** コンテンツピラー選択肢 */
const PILLAR_OPTIONS: { value: ContentPillar; label: string }[] = [
  { value: "education", label: "教育" },
  { value: "inspiration", label: "インスピレーション" },
  { value: "connection", label: "つながり" },
];

/** フォーム初期値 */
const INITIAL_STATE = {
  followerCount: "",
  postFormat: "" as string,
  contentPillar: "" as string,
  reach: "",
  impressions: "",
  likes: "",
  comments: "",
  saves: "",
  shares: "",
  follows: "",
  date: new Date().toISOString().split("T")[0],
};

/**
 * 投稿メトリクス入力フォーム
 * フォロワー数、フォーマット、ピラー、各指標を入力して分析を実行する
 */
export function MetricsForm() {
  const [form, setForm] = useState(INITIAL_STATE);
  const { addPost, setResult } = useAnalysisStore();

  /** テキスト入力のハンドラ */
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /** フォーム送信ハンドラ */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // PostMetrics オブジェクトを生成
    const metrics: PostMetrics = {
      id: crypto.randomUUID(),
      followerCount: Number(form.followerCount) || 0,
      postFormat: (form.postFormat || "image") as PostFormat,
      contentPillar: (form.contentPillar || "education") as ContentPillar,
      reach: Number(form.reach) || 0,
      impressions: Number(form.impressions) || 0,
      likes: Number(form.likes) || 0,
      comments: Number(form.comments) || 0,
      saves: Number(form.saves) || 0,
      shares: Number(form.shares) || 0,
      follows: Number(form.follows) || 0,
      date: form.date,
    };

    // スコア算出
    const result = calculateScore(metrics);

    // ストアに保存
    addPost(metrics);
    setResult(metrics.id, result);
  };

  /** 全入力値が有効か検証 */
  const isValid =
    Number(form.followerCount) > 0 &&
    form.postFormat !== "" &&
    form.contentPillar !== "" &&
    Number(form.reach) > 0;

  return (
    <Card className="border-border/50 bg-card/80 dark:bg-zinc-900/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">投稿メトリクスを入力</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* フォロワー数 */}
          <div className="space-y-2">
            <Label htmlFor="followerCount">フォロワー数</Label>
            <Input
              id="followerCount"
              type="number"
              min={0}
              placeholder="例: 5000"
              value={form.followerCount}
              onChange={(e) => handleChange("followerCount", e.target.value)}
              className="bg-card/80 dark:bg-zinc-900/50 border-border/50"
            />
          </div>

          {/* フォーマットとピラーの2カラム */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>投稿フォーマット</Label>
              <Select
                value={form.postFormat}
                onValueChange={(v) => handleChange("postFormat", v)}
              >
                <SelectTrigger className="w-full bg-card/80 dark:bg-zinc-900/50 border-border/50">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {FORMAT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>コンテンツピラー</Label>
              <Select
                value={form.contentPillar}
                onValueChange={(v) => handleChange("contentPillar", v)}
              >
                <SelectTrigger className="w-full bg-card/80 dark:bg-zinc-900/50 border-border/50">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {PILLAR_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* メトリクス入力グリッド */}
          <div className="space-y-3">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              エンゲージメント指標
            </Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {[
                { key: "reach", label: "リーチ", placeholder: "10000" },
                { key: "impressions", label: "インプレッション", placeholder: "15000" },
                { key: "likes", label: "いいね", placeholder: "500" },
                { key: "comments", label: "コメント", placeholder: "30" },
                { key: "saves", label: "保存", placeholder: "100" },
                { key: "shares", label: "シェア", placeholder: "20" },
                { key: "follows", label: "フォロー増", placeholder: "15" },
              ].map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={field.key} className="text-xs">
                    {field.label}
                  </Label>
                  <Input
                    id={field.key}
                    type="number"
                    min={0}
                    placeholder={field.placeholder}
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="bg-card/80 dark:bg-zinc-900/50 border-border/50 h-10 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 日付選択 */}
          <div className="space-y-2">
            <Label htmlFor="date">投稿日</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className="bg-card/80 dark:bg-zinc-900/50 border-border/50 w-full sm:w-auto"
            />
          </div>

          {/* 送信ボタン */}
          <Button
            type="submit"
            disabled={!isValid}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white font-semibold hover:opacity-90 transition-opacity border-0 h-11 text-base"
          >
            <Send className="mr-2 h-4 w-4" />
            分析する
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
