// ============================================================
// ハッシュタグ分析エンジン
// 投稿パフォーマンスデータからハッシュタグ別の効果を算出
// ============================================================

import type {
  PostMetrics,
  AnalysisResult,
  GeneratedCaption,
} from "@/lib/types";

// ============================================================
// 型定義
// ============================================================

/** 個別ハッシュタグのパフォーマンス */
export interface HashtagPerformance {
  tag: string;
  useCount: number; // 使用回数
  avgScore: number; // 使用時の平均スコア
  avgEngagement: number; // 平均エンゲージメント率
  avgSaveRate: number; // 平均保存率
  lastUsed: string; // 最終使用日（ISO date string）
}

/** ハッシュタグセットのパフォーマンス */
export interface HashtagSetPerformance {
  tags: string[];
  useCount: number;
  avgScore: number;
  avgEngagement: number;
}

// ============================================================
// 内部ヘルパー型
// ============================================================

/** マッチング結果（キャプションと投稿の紐付け） */
interface MatchedEntry {
  caption: GeneratedCaption;
  post: PostMetrics;
  result: AnalysisResult;
}

// ============================================================
// メイン分析関数
// ============================================================

/**
 * ハッシュタグ別パフォーマンスを分析する
 *
 * 分析手順:
 * 1. キャプション（ハッシュタグ保持）と投稿（メトリクス保持）を日付ベースでマッチング
 * 2. マッチしたペアからハッシュタグ別にスコア・ER・保存率を集計
 * 3. 使用回数降順でソートして返す
 *
 * @param posts - 投稿メトリクス配列
 * @param results - 投稿IDごとの分析結果
 * @param captions - 生成済みキャプション配列
 * @returns ハッシュタグ別パフォーマンス配列（使用回数降順）
 */
export function analyzeHashtagPerformance(
  posts: PostMetrics[],
  results: Record<string, AnalysisResult>,
  captions: GeneratedCaption[]
): HashtagPerformance[] {
  // マッチング: キャプションと投稿を日付の近さで紐付け
  const matched = matchCaptionsToPostsByDate(captions, posts, results);

  if (matched.length === 0) {
    return [];
  }

  // ハッシュタグ別に集計
  const tagStats: Record<
    string,
    {
      scores: number[];
      engagements: number[];
      saveRates: number[];
      lastUsed: string;
    }
  > = {};

  for (const entry of matched) {
    const { caption, post, result } = entry;

    for (const tag of caption.hashtags) {
      if (!tagStats[tag]) {
        tagStats[tag] = {
          scores: [],
          engagements: [],
          saveRates: [],
          lastUsed: post.date,
        };
      }

      const stat = tagStats[tag];
      stat.scores.push(result.overallScore);
      stat.engagements.push(result.engagementRate);
      stat.saveRates.push(result.saveRate);

      // 最終使用日を更新（より新しい日付を保持）
      if (post.date > stat.lastUsed) {
        stat.lastUsed = post.date;
      }
    }
  }

  // 集計結果をHashtagPerformance配列に変換
  const performances: HashtagPerformance[] = Object.entries(tagStats).map(
    ([tag, stat]) => ({
      tag,
      useCount: stat.scores.length,
      avgScore: roundTo(average(stat.scores), 1),
      avgEngagement: roundTo(average(stat.engagements), 2),
      avgSaveRate: roundTo(average(stat.saveRates), 2),
      lastUsed: stat.lastUsed,
    })
  );

  // 使用回数降順、同数ならスコア降順でソート
  performances.sort((a, b) => {
    if (b.useCount !== a.useCount) return b.useCount - a.useCount;
    return b.avgScore - a.avgScore;
  });

  return performances;
}

// ============================================================
// ベストハッシュタグセット特定
// ============================================================

/**
 * 最も効果的なハッシュタグセット（組み合わせ）を特定する
 *
 * キャプションに紐づくハッシュタグセット全体を1つの単位として、
 * 投稿パフォーマンスとの相関を算出する
 *
 * @param captions - 生成済みキャプション配列
 * @param results - 投稿IDごとの分析結果
 * @param posts - 投稿メトリクス配列
 * @returns ハッシュタグセットのパフォーマンス配列（スコア降順）
 */
export function findBestHashtagSets(
  captions: GeneratedCaption[],
  results: Record<string, AnalysisResult>,
  posts: PostMetrics[]
): HashtagSetPerformance[] {
  // マッチング
  const matched = matchCaptionsToPostsByDate(captions, posts, results);

  if (matched.length === 0) {
    return [];
  }

  // ハッシュタグセット（タグ配列をソートしたキー）別に集計
  const setStats: Record<
    string,
    {
      tags: string[];
      scores: number[];
      engagements: number[];
    }
  > = {};

  for (const entry of matched) {
    const { caption, result } = entry;
    const sortedTags = [...caption.hashtags].sort();
    const setKey = sortedTags.join("|");

    if (!setStats[setKey]) {
      setStats[setKey] = {
        tags: sortedTags,
        scores: [],
        engagements: [],
      };
    }

    setStats[setKey].scores.push(result.overallScore);
    setStats[setKey].engagements.push(result.engagementRate);
  }

  // 集計結果をHashtagSetPerformance配列に変換
  const performances: HashtagSetPerformance[] = Object.values(setStats).map(
    (stat) => ({
      tags: stat.tags,
      useCount: stat.scores.length,
      avgScore: roundTo(average(stat.scores), 1),
      avgEngagement: roundTo(average(stat.engagements), 2),
    })
  );

  // スコア降順でソート
  performances.sort((a, b) => b.avgScore - a.avgScore);

  return performances;
}

// ============================================================
// マッチングロジック
// ============================================================

/**
 * キャプションと投稿を日付の近さ（同日）でマッチングする
 *
 * 紐付けルール:
 * - キャプションのcreatedAtと投稿のdateが同日（YYYY-MM-DD一致）であればマッチ
 * - 1つの投稿に複数キャプションがマッチする場合は最初のキャプションを採用
 * - 分析結果が存在しない投稿はスキップ
 *
 * @param captions - キャプション配列
 * @param posts - 投稿配列
 * @param results - 分析結果レコード
 * @returns マッチしたエントリ配列
 */
function matchCaptionsToPostsByDate(
  captions: GeneratedCaption[],
  posts: PostMetrics[],
  results: Record<string, AnalysisResult>
): MatchedEntry[] {
  const matched: MatchedEntry[] = [];
  const usedPostIds = new Set<string>();

  for (const caption of captions) {
    // ハッシュタグが空のキャプションはスキップ
    if (caption.hashtags.length === 0) continue;

    const captionDate = toDateString(caption.createdAt);

    // 同日の投稿を検索
    for (const post of posts) {
      if (usedPostIds.has(post.id)) continue;

      const postDate = toDateString(post.date);
      const result = results[post.id];

      if (captionDate === postDate && result) {
        matched.push({ caption, post, result });
        usedPostIds.add(post.id);
        break; // 1キャプション → 1投稿の対応
      }
    }
  }

  return matched;
}

// ============================================================
// ユーティリティ
// ============================================================

/**
 * ISO日付文字列からYYYY-MM-DD部分を抽出する
 * @param isoString - ISO日付文字列
 * @returns YYYY-MM-DD形式の日付文字列
 */
function toDateString(isoString: string): string {
  return isoString.slice(0, 10);
}

/**
 * 数値配列の平均値を算出する
 * @param values - 数値配列
 * @returns 平均値（空配列の場合は0）
 */
function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * 数値を指定桁数で丸める
 * @param value - 丸める数値
 * @param decimals - 小数点以下の桁数
 * @returns 丸められた数値
 */
function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
