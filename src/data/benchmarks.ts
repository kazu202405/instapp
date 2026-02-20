// ============================================================
// InstaGrowth - パフォーマンスベンチマーク
// フォロワー規模別のInstagramエンゲージメント基準値
// low: 下位25%, mid: 中央値, high: 上位25%
// ============================================================

import { FollowerTier } from '@/lib/types';

// ティア別ベンチマークの型定義
export interface TierBenchmark {
  tier: FollowerTier;
  label: string; // 日本語ラベル
  range: string; // フォロワー数の範囲（表示用）
  engagementRate: { low: number; mid: number; high: number }; // エンゲージメント率（%）
  saveRate: { low: number; mid: number; high: number }; // 保存率（%）
  shareRate: { low: number; mid: number; high: number }; // シェア率（%）
  commentRate: { low: number; mid: number; high: number }; // コメント率（%）
  followConversion: { low: number; mid: number; high: number }; // フォロー転換率（%）
}

export const benchmarks: Record<FollowerTier, TierBenchmark> = {
  nano: {
    tier: 'nano',
    label: 'ナノ',
    range: '0〜1,000',
    engagementRate: { low: 5.0, mid: 7.0, high: 10.0 },
    saveRate: { low: 3.0, mid: 4.0, high: 6.0 },
    shareRate: { low: 0.5, mid: 1.0, high: 2.0 },
    commentRate: { low: 1.0, mid: 2.0, high: 4.0 },
    followConversion: { low: 1.0, mid: 3.0, high: 5.0 },
  },
  micro: {
    tier: 'micro',
    label: 'マイクロ',
    range: '1,000〜10,000',
    engagementRate: { low: 3.0, mid: 4.5, high: 6.0 },
    saveRate: { low: 2.0, mid: 3.0, high: 5.0 },
    shareRate: { low: 0.3, mid: 0.8, high: 1.5 },
    commentRate: { low: 0.5, mid: 1.5, high: 3.0 },
    followConversion: { low: 0.5, mid: 2.0, high: 4.0 },
  },
  mid: {
    tier: 'mid',
    label: 'ミドル',
    range: '10,000〜50,000',
    engagementRate: { low: 1.5, mid: 2.5, high: 4.0 },
    saveRate: { low: 1.5, mid: 2.5, high: 4.0 },
    shareRate: { low: 0.2, mid: 0.5, high: 1.0 },
    commentRate: { low: 0.3, mid: 1.0, high: 2.0 },
    followConversion: { low: 0.3, mid: 1.0, high: 2.5 },
  },
  macro: {
    tier: 'macro',
    label: 'マクロ',
    range: '50,000〜500,000',
    engagementRate: { low: 1.0, mid: 1.8, high: 3.0 },
    saveRate: { low: 1.0, mid: 1.8, high: 3.0 },
    shareRate: { low: 0.1, mid: 0.3, high: 0.8 },
    commentRate: { low: 0.2, mid: 0.5, high: 1.5 },
    followConversion: { low: 0.1, mid: 0.5, high: 1.5 },
  },
  mega: {
    tier: 'mega',
    label: 'メガ',
    range: '500,000+',
    engagementRate: { low: 0.5, mid: 1.0, high: 2.0 },
    saveRate: { low: 0.5, mid: 1.0, high: 2.0 },
    shareRate: { low: 0.05, mid: 0.2, high: 0.5 },
    commentRate: { low: 0.1, mid: 0.3, high: 1.0 },
    followConversion: { low: 0.05, mid: 0.2, high: 0.8 },
  },
};

// フォロワー数からティアを判定するユーティリティ
export function getFollowerTier(followerCount: number): FollowerTier {
  if (followerCount < 1000) return 'nano';
  if (followerCount < 10000) return 'micro';
  if (followerCount < 50000) return 'mid';
  if (followerCount < 500000) return 'macro';
  return 'mega';
}

// 指定メトリクスのパーセンタイルを算出するユーティリティ
// 値がlow以下なら0、high以上なら100、間は線形補間
export function calculatePercentile(
  value: number,
  range: { low: number; mid: number; high: number }
): number {
  if (value <= range.low) return 0;
  if (value >= range.high) return 100;

  // low〜midは0〜50、mid〜highは50〜100として線形補間
  if (value <= range.mid) {
    return ((value - range.low) / (range.mid - range.low)) * 50;
  }
  return 50 + ((value - range.mid) / (range.high - range.mid)) * 50;
}
