// ============================================================
// ハッシュタグ戦略エンジン
// 3層戦略: Big（発見） → Medium（競争） → Niche（上位表示）
// 合計5〜8タグを選定し、発見から上位表示までカバーする
// ============================================================

import type { Genre } from '@/lib/types';
import { hashtagPools, universalHashtags, type HashtagEntry } from '@/data/hashtags';

/**
 * ハッシュタグ選定結果
 */
export interface HashtagResult {
  hashtags: string[];
  layers: {
    big: string[];
    medium: string[];
    niche: string[];
  };
  strategy: string; // 選定理由
}

// ============================================================
// メイン選定関数
// ============================================================

/**
 * 3層戦略に基づいてハッシュタグを選定する
 *
 * 戦略:
 * - Big（100K+投稿）: 1-2タグ → 発見性を確保（競争は激しいが露出機会を得る）
 * - Medium（10K-100K投稿）: 2-3タグ → 競争バランス（上位表示の可能性あり）
 * - Niche（<10K投稿）: 2-3タグ → 上位表示を狙う（確実にランクイン）
 *
 * @param genre - 投稿ジャンル
 * @param keywords - 投稿キーワード
 * @param theme - 投稿テーマ
 * @returns ハッシュタグ選定結果
 */
export function selectHashtags(
  genre: Genre,
  keywords: string[],
  theme: string,
): HashtagResult {
  // ジャンル別プールを取得（存在しない場合はライフスタイルをフォールバック）
  const pool = hashtagPools[genre] ?? hashtagPools.lifestyle;

  // 各レイヤーに分類
  const bigPool = pool.filter((h) => h.layer === 'big');
  const mediumPool = pool.filter((h) => h.layer === 'medium');
  const nichePool = pool.filter((h) => h.layer === 'niche');

  // 各レイヤーからランダム選択
  const selectedBig = pickMultiple(bigPool, randomInRange(1, 2));
  const selectedMedium = pickMultiple(mediumPool, randomInRange(2, 3));
  const selectedNiche = pickMultiple(nichePool, randomInRange(2, 3));

  // キーワードベースのタグを追加（あれば）
  const keywordTags = generateKeywordHashtags(keywords, theme);

  // 汎用タグから1つ追加（合計が8を超えない範囲）
  const currentTotal =
    selectedBig.length + selectedMedium.length + selectedNiche.length + keywordTags.length;
  const universalCount = Math.max(0, Math.min(1, 8 - currentTotal));
  const selectedUniversal = pickMultiple(universalHashtags, universalCount);

  // 各レイヤーのタグ文字列配列を作成
  const bigTags = selectedBig.map((h) => h.tag);
  const mediumTags = [
    ...selectedMedium.map((h) => h.tag),
    ...selectedUniversal.map((h) => h.tag),
  ];
  const nicheTags = [
    ...selectedNiche.map((h) => h.tag),
    ...keywordTags,
  ];

  // 全タグを結合（重複排除）
  const allTags = deduplicateTags([...bigTags, ...mediumTags, ...nicheTags]);

  // 合計5-8タグに収める
  const finalTags = allTags.slice(0, 8);
  const finalBig = finalTags.filter((t) => bigTags.includes(t));
  const finalMedium = finalTags.filter((t) => mediumTags.includes(t));
  const finalNiche = finalTags.filter(
    (t) => !finalBig.includes(t) && !finalMedium.includes(t),
  );

  // 選定理由の生成
  const strategy = buildStrategyDescription(
    finalBig.length,
    finalMedium.length,
    finalNiche.length,
    genre,
  );

  return {
    hashtags: finalTags,
    layers: {
      big: finalBig,
      medium: finalMedium,
      niche: finalNiche,
    },
    strategy,
  };
}

// ============================================================
// キーワードベースタグ生成
// ============================================================

/**
 * キーワードやテーマからハッシュタグを生成する
 * ユーザー入力に基づく固有タグで差別化を図る
 * @param keywords - キーワード配列
 * @param theme - テーマ
 * @returns 生成されたハッシュタグ配列
 */
function generateKeywordHashtags(keywords: string[], theme: string): string[] {
  const tags: string[] = [];

  // キーワードからタグ生成（最大2つ）
  const targetKeywords = keywords.slice(0, 2);
  for (const keyword of targetKeywords) {
    // 既にハッシュタグ形式ならそのまま使用
    if (keyword.startsWith('#')) {
      tags.push(keyword);
    } else {
      tags.push(`#${keyword}`);
    }
  }

  // テーマが短い場合はタグとして追加
  if (theme.length > 0 && theme.length <= 15 && tags.length < 2) {
    const themeTag = `#${theme.replace(/\s+/g, '')}`;
    if (!tags.includes(themeTag)) {
      tags.push(themeTag);
    }
  }

  return tags.slice(0, 2);
}

// ============================================================
// 戦略説明生成
// ============================================================

/**
 * 選定戦略の説明文を生成する
 * @param bigCount - Bigタグ数
 * @param mediumCount - Mediumタグ数
 * @param nicheCount - Nicheタグ数
 * @param genre - ジャンル
 * @returns 戦略説明文
 */
function buildStrategyDescription(
  bigCount: number,
  mediumCount: number,
  nicheCount: number,
  genre: Genre,
): string {
  const total = bigCount + mediumCount + nicheCount;
  const genreName = genreToJapanese(genre);

  const parts: string[] = [
    `${genreName}ジャンルで${total}タグを3層戦略で選定。`,
  ];

  if (bigCount > 0) {
    parts.push(
      `Big層${bigCount}タグで発見性を確保（100K+投稿のビッグタグで新規リーチを獲得）。`,
    );
  }

  if (mediumCount > 0) {
    parts.push(
      `Medium層${mediumCount}タグで競争バランスを最適化（10K-100K投稿で上位表示の可能性あり）。`,
    );
  }

  if (nicheCount > 0) {
    parts.push(
      `Niche層${nicheCount}タグで確実な上位表示を狙う（<10K投稿で人気投稿にランクイン）。`,
    );
  }

  return parts.join('');
}

// ============================================================
// ユーティリティ
// ============================================================

/**
 * 配列からランダムにn個選択する（重複なし）
 * @param arr - 選択対象の配列
 * @param count - 選択数
 * @returns 選択された要素の配列
 */
function pickMultiple<T>(arr: T[], count: number): T[] {
  if (arr.length === 0) return [];
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

/**
 * 指定範囲内のランダム整数を返す（min以上max以下）
 * @param min - 最小値
 * @param max - 最大値
 * @returns ランダム整数
 */
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * ハッシュタグ配列から重複を除去する
 * @param tags - ハッシュタグ配列
 * @returns 重複除去済みの配列
 */
function deduplicateTags(tags: string[]): string[] {
  return [...new Set(tags)];
}

/**
 * ジャンルを日本語名に変換する
 * @param genre - ジャンル
 * @returns 日本語ジャンル名
 */
function genreToJapanese(genre: Genre): string {
  const map: Record<Genre, string> = {
    fitness: 'フィットネス',
    food: '料理・グルメ',
    travel: '旅行',
    beauty: '美容',
    business: 'ビジネス',
    lifestyle: 'ライフスタイル',
    tech: 'テック',
    education: '教育・学び',
    fashion: 'ファッション',
    photography: '写真',
  };
  return map[genre] ?? genre;
}
