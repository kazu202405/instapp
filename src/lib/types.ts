// ============================================================
// InstaGrowth - 型定義
// Instagram成長支援ツールの全体型システム
// ============================================================

// ジャンル（投稿カテゴリ）
export type Genre =
  | "fitness"
  | "food"
  | "travel"
  | "beauty"
  | "business"
  | "lifestyle"
  | "tech"
  | "education"
  | "fashion"
  | "photography";

// フック類型（6つ）
export type HookType =
  | "curiosity"
  | "controversy"
  | "story"
  | "number"
  | "question"
  | "shock";

// 狙うアクション
export type TargetAction = "save" | "share" | "comment" | "follow" | "click";

// ストーリー構造型
export type StoryStructure =
  | "education"
  | "narrative"
  | "empathy"
  | "authority"
  | "lossAversion";

// コンテンツピラー
export type ContentPillar = "education" | "inspiration" | "connection";

// 投稿フォーマット
export type PostFormat = "reel" | "carousel" | "image" | "story";

// フォロワー規模
// nano: 0-1K, micro: 1K-10K, mid: 10K-50K, macro: 50K-500K, mega: 500K+
export type FollowerTier = "nano" | "micro" | "mid" | "macro" | "mega";

// ============================================================
// キャプション生成
// ============================================================

// キャプション生成入力
export interface CaptionInput {
  genre: Genre;
  theme: string; // テーマ（自由入力）
  keywords: string[]; // キーワード
  targetAction: TargetAction;
  hookType: HookType;
  includeEmoji: boolean;
}

// 生成されたキャプション
export interface GeneratedCaption {
  id: string;
  hook: string; // フック文
  story: string; // ストーリー部分
  value: string; // 価値提供部分
  cta: string; // CTA
  fullCaption: string; // 全文
  hashtags: string[]; // ハッシュタグ
  hookReason: string; // フック選択の行動科学的理由
  ctaReason: string; // CTA選択の理由
  imagePrompt?: string; // 投稿画像生成用プロンプト（GPT/SORA用）
  storyStructure: StoryStructure;
  input: CaptionInput;
  createdAt: string; // ISO date string
}

// ============================================================
// 投稿分析
// ============================================================

// 投稿分析入力
export interface PostMetrics {
  id: string;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  follows: number; // フォロー増加数
  followerCount: number; // 投稿時のフォロワー数
  postFormat: PostFormat;
  contentPillar: ContentPillar;
  date: string; // ISO date string
}

// ベンチマーク比較項目
export interface BenchmarkComparison {
  metric: string;
  value: number;
  benchmark: number;
  percentile: number;
}

// 分析結果
export interface AnalysisResult {
  overallScore: number; // 0-100
  engagementRate: number;
  saveRate: number;
  shareRate: number;
  benchmarkComparison: BenchmarkComparison[];
  diagnosis: string; // 行動科学的診断
  improvements: string[]; // 改善アクション3つ
  abTestSuggestion: string; // A/Bテスト提案
}

// ============================================================
// カレンダー
// ============================================================

// カレンダーエントリ
export interface CalendarEntry {
  id: string;
  date: string; // ISO date string
  time: string; // HH:mm
  pillar: ContentPillar;
  format: PostFormat;
  theme: string;
  hookType: HookType;
  caption?: GeneratedCaption; // 生成済みキャプション（あれば）
  status: "planned" | "drafted" | "posted";
}

// ============================================================
// プロフィール最適化
// ============================================================

// プロフィールチェックリスト項目
export interface ProfileCheckItem {
  id: string;
  category: "name" | "bio" | "cta" | "photo" | "highlights" | "pinned";
  label: string;
  description: string;
  psychologyReason: string; // 行動科学的理由
  completed: boolean;
  weight: number; // スコア重み（1-10）
}

// ============================================================
// A/Bテスト
// ============================================================

// A/Bテスト
export interface ABTest {
  id: string;
  hypothesis: string; // 仮説
  psychologyPrinciple: string; // 心理原理
  variableA: string;
  variableB: string;
  metric: string; // 測定指標
  resultA?: number;
  resultB?: number;
  winner?: "A" | "B" | null;
  learning: string; // 学びの記録
  status: "active" | "completed";
  createdAt: string;
  completedAt?: string;
}

// ============================================================
// ダッシュボード
// ============================================================

// ダッシュボード統計
export interface DashboardStats {
  totalPosts: number;
  avgEngagementRate: number;
  avgScore: number;
  captionsGenerated: number;
  profileScore: number;
  activeTests: number;
}
