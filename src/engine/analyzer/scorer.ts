// ============================================================
// 投稿分析スコアリングエンジン
// Instagramベンチマークに基づく投稿パフォーマンス評価
// スコア重み: エンゲージメント30% / 保存率25% / シェア率20%
//            コメント品質15% / フォロー転換10%
// ============================================================

import type { PostMetrics, AnalysisResult, FollowerTier, BenchmarkComparison } from '@/lib/types';

// ============================================================
// ベンチマーク定義
// ============================================================

/**
 * フォロワー規模別ベンチマーク
 * Instagram業界標準の指標をベースに設定
 */
interface TierBenchmark {
  engagementRate: number;  // エンゲージメント率（%）
  saveRate: number;        // 保存率（%）
  shareRate: number;       // シェア率（%）
  commentRate: number;     // コメント率（%）
  followConversion: number; // フォロー転換率（%）
}

/** フォロワー規模別ベンチマーク定数 */
const TIER_BENCHMARKS: Record<FollowerTier, TierBenchmark> = {
  nano: {
    engagementRate: 6.5,
    saveRate: 4.0,
    shareRate: 1.5,
    commentRate: 2.0,
    followConversion: 3.0,
  },
  micro: {
    engagementRate: 4.0,
    saveRate: 3.0,
    shareRate: 1.0,
    commentRate: 1.2,
    followConversion: 2.0,
  },
  mid: {
    engagementRate: 2.25,
    saveRate: 2.25,
    shareRate: 0.7,
    commentRate: 0.8,
    followConversion: 1.2,
  },
  macro: {
    engagementRate: 1.5,
    saveRate: 1.5,
    shareRate: 0.5,
    commentRate: 0.5,
    followConversion: 0.7,
  },
  mega: {
    engagementRate: 1.0,
    saveRate: 1.0,
    shareRate: 0.3,
    commentRate: 0.3,
    followConversion: 0.4,
  },
};

/** スコア重み定数 */
const SCORE_WEIGHTS = {
  engagement: 0.30,
  save: 0.25,
  share: 0.20,
  comment: 0.15,
  followConversion: 0.10,
} as const;

// ============================================================
// フォロワー規模判定
// ============================================================

/**
 * フォロワー数からフォロワー規模を判定する
 * @param count - フォロワー数
 * @returns フォロワー規模
 */
export function getFollowerTier(count: number): FollowerTier {
  if (count < 1000) return 'nano';
  if (count < 10000) return 'micro';
  if (count < 50000) return 'mid';
  if (count < 500000) return 'macro';
  return 'mega';
}

// ============================================================
// スコア算出
// ============================================================

/**
 * 投稿メトリクスを分析してスコアを算出する
 * @param metrics - 投稿メトリクス
 * @returns 分析結果
 */
export function calculateScore(metrics: PostMetrics): AnalysisResult {
  const tier = getFollowerTier(metrics.followerCount);
  const benchmark = TIER_BENCHMARKS[tier];

  // 各指標の実績値を算出
  const reach = Math.max(metrics.reach, 1); // ゼロ除算防止
  const followerCount = Math.max(metrics.followerCount, 1);

  const engagementRate =
    ((metrics.likes + metrics.comments + metrics.saves + metrics.shares) / reach) * 100;
  const saveRate = (metrics.saves / reach) * 100;
  const shareRate = (metrics.shares / reach) * 100;
  const commentRate = (metrics.comments / reach) * 100;
  const followConversion = (metrics.follows / reach) * 100;

  // 各指標のパーセンタイル算出（ベンチマーク対比）
  const engagementPercentile = calculatePercentile(engagementRate, benchmark.engagementRate);
  const savePercentile = calculatePercentile(saveRate, benchmark.saveRate);
  const sharePercentile = calculatePercentile(shareRate, benchmark.shareRate);
  const commentPercentile = calculatePercentile(commentRate, benchmark.commentRate);
  const followPercentile = calculatePercentile(followConversion, benchmark.followConversion);

  // 加重スコア算出（0-100）
  const overallScore = Math.round(
    clamp(
      engagementPercentile * SCORE_WEIGHTS.engagement +
        savePercentile * SCORE_WEIGHTS.save +
        sharePercentile * SCORE_WEIGHTS.share +
        commentPercentile * SCORE_WEIGHTS.comment +
        followPercentile * SCORE_WEIGHTS.followConversion,
      0,
      100,
    ),
  );

  // ベンチマーク比較データ作成
  const benchmarkComparison: BenchmarkComparison[] = [
    {
      metric: 'エンゲージメント率',
      value: round2(engagementRate),
      benchmark: benchmark.engagementRate,
      percentile: Math.round(engagementPercentile),
    },
    {
      metric: '保存率',
      value: round2(saveRate),
      benchmark: benchmark.saveRate,
      percentile: Math.round(savePercentile),
    },
    {
      metric: 'シェア率',
      value: round2(shareRate),
      benchmark: benchmark.shareRate,
      percentile: Math.round(sharePercentile),
    },
    {
      metric: 'コメント率',
      value: round2(commentRate),
      benchmark: benchmark.commentRate,
      percentile: Math.round(commentPercentile),
    },
    {
      metric: 'フォロー転換率',
      value: round2(followConversion),
      benchmark: benchmark.followConversion,
      percentile: Math.round(followPercentile),
    },
  ];

  // 診断文生成
  const diagnosis = generateDiagnosis(metrics, tier, benchmarkComparison);

  // 改善アクション生成
  const improvements = generateImprovements(metrics, benchmarkComparison, tier);

  // A/Bテスト提案
  const abTestSuggestion = suggestABTest(metrics, benchmarkComparison);

  return {
    overallScore,
    engagementRate: round2(engagementRate),
    saveRate: round2(saveRate),
    shareRate: round2(shareRate),
    benchmarkComparison,
    diagnosis,
    improvements,
    abTestSuggestion,
  };
}

// ============================================================
// ベンチマーク取得
// ============================================================

/**
 * 指定フォロワー規模のベンチマーク値を取得する
 * @param tier - フォロワー規模
 * @returns ベンチマーク値の辞書
 */
export function getBenchmark(tier: FollowerTier): Record<string, number> {
  const b = TIER_BENCHMARKS[tier];
  return {
    engagementRate: b.engagementRate,
    saveRate: b.saveRate,
    shareRate: b.shareRate,
    commentRate: b.commentRate,
    followConversion: b.followConversion,
  };
}

// ============================================================
// 診断生成
// ============================================================

/**
 * メトリクスとベンチマーク比較から診断文を生成する
 * @param metrics - 投稿メトリクス
 * @param tier - フォロワー規模
 * @param comparisons - ベンチマーク比較結果
 * @returns 診断文
 */
function generateDiagnosis(
  metrics: PostMetrics,
  tier: FollowerTier,
  comparisons: BenchmarkComparison[],
): string {
  const tierNameMap: Record<FollowerTier, string> = {
    nano: 'ナノ（0-1K）',
    micro: 'マイクロ（1K-10K）',
    mid: 'ミドル（10K-50K）',
    macro: 'マクロ（50K-500K）',
    mega: 'メガ（500K+）',
  };

  const tierName = tierNameMap[tier];

  // 最高指標と最低指標を特定
  const sorted = [...comparisons].sort((a, b) => b.percentile - a.percentile);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  // リーチ倍率（リーチ / フォロワー数）
  const reachMultiplier = metrics.followerCount > 0
    ? round2(metrics.reach / metrics.followerCount)
    : 0;

  const parts: string[] = [];

  // 規模と概況
  parts.push(
    `${tierName}アカウントとしての分析結果です。`,
  );

  // リーチ評価
  if (reachMultiplier >= 2.0) {
    parts.push(
      `リーチ倍率${reachMultiplier}xはフォロワー外への拡散が成功しています（バイラル傾向）。`,
    );
  } else if (reachMultiplier >= 1.0) {
    parts.push(
      `リーチ倍率${reachMultiplier}xはフォロワーの大部分に届いています。`,
    );
  } else {
    parts.push(
      `リーチ倍率${reachMultiplier}xはフォロワーの一部にしか届いていません。投稿頻度やタイミングの見直しが有効です。`,
    );
  }

  // 強み
  if (strongest.percentile >= 70) {
    parts.push(
      `【強み】${strongest.metric}が${strongest.value}%とベンチマーク${strongest.benchmark}%を大きく上回っています。`,
    );
  }

  // 弱み
  if (weakest.percentile < 40) {
    parts.push(
      `【課題】${weakest.metric}が${weakest.value}%とベンチマーク${weakest.benchmark}%を下回っています。ここが改善の最大チャンスです。`,
    );
  }

  // 行動科学的洞察
  const reach = Math.max(metrics.reach, 1);
  const saveRate = (metrics.saves / reach) * 100;
  const shareRate = (metrics.shares / reach) * 100;

  if (saveRate > shareRate * 2) {
    parts.push(
      '保存率がシェア率の2倍以上あるため「自分用に保持したい」コンテンツとして認識されています（保有効果）。シェアを促すCTAを強化すると拡散力が向上します。',
    );
  } else if (shareRate > saveRate) {
    parts.push(
      'シェア率が保存率を上回っており「他者に共有したい」コンテンツです（社会的証明の活用が機能中）。保存を促すCTAを追加するとストック価値も獲得できます。',
    );
  }

  return parts.join('');
}

// ============================================================
// 改善アクション生成
// ============================================================

/**
 * ベンチマーク比較から具体的な改善アクションを3つ生成する
 * @param metrics - 投稿メトリクス
 * @param comparisons - ベンチマーク比較結果
 * @param tier - フォロワー規模
 * @returns 改善アクション配列（最大3つ）
 */
function generateImprovements(
  metrics: PostMetrics,
  comparisons: BenchmarkComparison[],
  tier: FollowerTier,
): string[] {
  const improvements: string[] = [];

  // パーセンタイルが低い順にソート
  const weakPoints = [...comparisons].sort((a, b) => a.percentile - b.percentile);

  for (const point of weakPoints) {
    if (improvements.length >= 3) break;

    if (point.metric === 'エンゲージメント率' && point.percentile < 60) {
      improvements.push(
        'フック文を「好奇心ギャップ」型に変更してみましょう。「99%が知らない〇〇」のような形式は、読者の知識ギャップを刺激してスクロール停止率を高めます。',
      );
    }

    if (point.metric === '保存率' && point.percentile < 60) {
      improvements.push(
        '「後で見返せるように保存してね」と明示的に保存を促すCTAを追加しましょう。保有効果により、一度保存すると投稿への愛着が生まれ、フォロー転換率も向上します。',
      );
    }

    if (point.metric === 'シェア率' && point.percentile < 60) {
      improvements.push(
        '「これ知らない人多いから、ストーリーズでシェアしてほしい」と社会的証明を活用したCTAを追加しましょう。「知っている側」になれることがシェアの動機になります。',
      );
    }

    if (point.metric === 'コメント率' && point.percentile < 60) {
      improvements.push(
        'キャプションの最後に「あなたはどう思いますか？」と質問を追加しましょう。アイデンティティバイアスにより、自分の意見を表明したい欲求がコメントを促進します。',
      );
    }

    if (point.metric === 'フォロー転換率' && point.percentile < 60) {
      improvements.push(
        'プロフィールの価値提案を見直しましょう。「フォローすると〇〇が届く」と返報性を活用した明確なメリットを提示すると、フォロー転換率が改善します。',
      );
    }
  }

  // 3つに満たない場合は汎用的な改善提案を追加
  const genericImprovements = [
    '投稿時間を平日7-9時または19-21時（JST）に最適化しましょう。アルゴリズム上、投稿直後のエンゲージメント速度がリーチを左右します。',
    'カルーセル投稿を試しましょう。ツァイガルニク効果により「続きを見る」行動が促進され、滞在時間が延びてアルゴリズム評価が向上します。',
    'ストーリーズで投稿をシェアし、質問スタンプで反応を促しましょう。ストーリーズ経由のエンゲージメントもフィード投稿のリーチに影響します。',
  ];

  let genericIndex = 0;
  while (improvements.length < 3 && genericIndex < genericImprovements.length) {
    improvements.push(genericImprovements[genericIndex]);
    genericIndex++;
  }

  return improvements.slice(0, 3);
}

// ============================================================
// A/Bテスト提案
// ============================================================

/**
 * メトリクスの弱点に基づいてA/Bテストを提案する
 * @param metrics - 投稿メトリクス
 * @param comparisons - ベンチマーク比較結果
 * @returns A/Bテスト提案文
 */
function suggestABTest(
  metrics: PostMetrics,
  comparisons: BenchmarkComparison[],
): string {
  // 最も弱い指標に対するテストを提案
  const weakest = [...comparisons].sort((a, b) => a.percentile - b.percentile)[0];

  const testSuggestions: Record<string, string> = {
    'エンゲージメント率':
      '【A/Bテスト提案】フック文比較テスト：A案「好奇心ギャップ型フック」vs B案「数字型フック」でエンゲージメント率を比較。同じ内容の投稿でフック文だけを変えて、7日間で各3投稿ずつテストしましょう。',
    '保存率':
      '【A/Bテスト提案】CTA比較テスト：A案「保存して後で見返してね」vs B案「この情報、保存しないと損します」で保存率を比較。返報性 vs 損失回避のどちらが効果的か検証しましょう。',
    'シェア率':
      '【A/Bテスト提案】シェアCTA比較テスト：A案「友達にシェアしてあげてね」vs B案「これ知らない人多いからシェアしてほしい」でシェア率を比較。利他的動機 vs 社会的証明のどちらが効果的か検証しましょう。',
    'コメント率':
      '【A/Bテスト提案】質問形式テスト：A案「あなたはどう思いますか？」vs B案「一番響いたポイントを教えて！」でコメント率を比較。オープンクエスチョン vs 具体的質問のどちらが有効か検証しましょう。',
    'フォロー転換率':
      '【A/Bテスト提案】バリュープロポジションテスト：A案「毎日役立つ情報を発信中」vs B案「フォローすると〇〇が届きます」でフォロー転換率を比較。一般的 vs 具体的な価値提案を検証しましょう。',
  };

  return (
    testSuggestions[weakest.metric] ??
    '【A/Bテスト提案】投稿フォーマット比較テスト：A案「カルーセル投稿」vs B案「リール投稿」で総合エンゲージメントを比較しましょう。'
  );
}

// ============================================================
// ユーティリティ
// ============================================================

/**
 * 実績値とベンチマーク値からパーセンタイル（0-100）を算出する
 * ベンチマーク値を50パーセンタイルとして正規分布的にスケーリング
 * @param actual - 実績値
 * @param benchmark - ベンチマーク値
 * @returns パーセンタイル（0-100）
 */
function calculatePercentile(actual: number, benchmark: number): number {
  if (benchmark <= 0) return 50;

  // ベンチマーク対比の比率を算出
  const ratio = actual / benchmark;

  // シグモイド的なスケーリング
  // ratio=0 → 0, ratio=0.5 → 25, ratio=1.0 → 50, ratio=1.5 → 75, ratio=2.0 → 90, ratio=3.0+ → ~100
  const scaled = 100 / (1 + Math.exp(-3 * (ratio - 1)));

  return clamp(scaled, 0, 100);
}

/**
 * 値を指定範囲にクランプする
 * @param value - 対象値
 * @param min - 最小値
 * @param max - 最大値
 * @returns クランプされた値
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * 小数点以下2桁に丸める
 * @param value - 対象値
 * @returns 丸められた値
 */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
