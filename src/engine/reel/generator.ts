// ============================================================
// リール台本生成エンジン
// テンプレートベースの動画台本自動生成
// フック → セクション → CTA の構造で台本を組み立てる
// ============================================================

import type { Genre, HookType } from '@/lib/types';
import { hookTemplates } from '@/data/templates';
import {
  styleTemplates,
  musicSuggestions,
  genreVisualPatterns,
  type ReelStyle,
  type StyleTemplate,
  type SectionStructure,
} from '@/data/reelTemplates';
import { selectHashtags } from '@/engine/hashtag/strategy';

// ============================================================
// 型定義
// ============================================================

/** リール台本生成入力 */
export interface ReelScriptInput {
  genre: Genre;
  theme: string;
  duration: 15 | 30 | 60 | 90;
  style: ReelStyle;
  keywords: string[];
  hookType: HookType;
}

/** リール台本のセクション */
export interface ReelSection {
  text: string;
  duration: number;
  visualNote: string;
}

/** 生成されたリール台本 */
export interface ReelScript {
  id: string;
  hook: ReelSection;
  sections: ReelSection[];
  cta: ReelSection;
  totalDuration: number;
  caption: string;
  hashtags: string[];
  musicSuggestion: string;
  input: ReelScriptInput;
  createdAt: string;
}

// ============================================================
// メイン生成関数
// ============================================================

/**
 * リール台本を生成する
 * スタイル別テンプレート選択 → 変数置換 → セクション配分 → 組み立て
 * @param input - リール台本生成入力
 * @returns 生成されたリール台本
 */
export function generateReelScript(input: ReelScriptInput): ReelScript {
  const { genre, theme, duration, style, keywords, hookType } = input;

  // 1. スタイルテンプレート取得
  const template = getStyleTemplate(style);

  // 2. セクション構造取得（duration別）
  const sectionStructures = getSectionStructures(template, duration);

  // 3. 時間配分計算
  const hookDuration = getHookDuration(duration);
  const ctaDuration = getCtaDuration(duration);
  const bodyDuration = duration - hookDuration - ctaDuration;

  // 4. フック生成
  const hookText = generateHookText(hookType, genre, theme, keywords);
  const hookVisual = getVisualNote(genre, ['自撮り', 'テキストオーバーレイ']);
  const hook: ReelSection = {
    text: hookText,
    duration: hookDuration,
    visualNote: hookVisual,
  };

  // 5. 本編セクション生成
  const sections = sectionStructures.map((structure) => {
    const sectionDuration = Math.round(bodyDuration * structure.durationRatio);
    const text = replaceVariables(structure.textTemplate, theme, keywords);
    const visualNote = getVisualNote(genre, structure.visualSuggestions);

    return {
      text,
      duration: sectionDuration,
      visualNote,
    };
  });

  // 6. CTA生成
  const ctaText = replaceVariables(template.ctaTemplate, theme, keywords);
  const ctaVisual = getVisualNote(genre, ['自撮り', 'テキストオーバーレイ']);
  const cta: ReelSection = {
    text: ctaText,
    duration: ctaDuration,
    visualNote: ctaVisual,
  };

  // 7. 投稿用キャプション生成
  const caption = generateCaption(theme, keywords, style);

  // 8. ハッシュタグ生成
  const hashtagResult = selectHashtags(genre, keywords, theme);

  // 9. BGM提案
  const music = getMusicSuggestion(genre, style);

  // 10. ID生成
  const id = generateId();

  return {
    id,
    hook,
    sections,
    cta,
    totalDuration: duration,
    caption,
    hashtags: hashtagResult.hashtags,
    musicSuggestion: music,
    input,
    createdAt: new Date().toISOString(),
  };
}

// ============================================================
// スタイルテンプレート取得
// ============================================================

/**
 * スタイルに対応するテンプレートを取得する
 * @param style - リールスタイル
 * @returns スタイルテンプレート
 */
function getStyleTemplate(style: ReelStyle): StyleTemplate {
  const template = styleTemplates.find((t) => t.style === style);
  if (!template) {
    // フォールバック: 教育型
    return styleTemplates[0];
  }
  return template;
}

// ============================================================
// セクション構造取得
// ============================================================

/**
 * duration別にセクション構造を取得する
 * 15秒=short(2セクション), 30秒=medium(3), 60秒=long(5), 90秒=extraLong(7)
 * @param template - スタイルテンプレート
 * @param duration - 動画長さ（秒）
 * @returns セクション構造配列
 */
function getSectionStructures(
  template: StyleTemplate,
  duration: 15 | 30 | 60 | 90,
): SectionStructure[] {
  switch (duration) {
    case 15:
      return template.sections.short;
    case 30:
      return template.sections.medium;
    case 60:
      return template.sections.long;
    case 90:
      return template.sections.extraLong;
    default:
      return template.sections.medium;
  }
}

// ============================================================
// フック生成
// ============================================================

/**
 * フックテンプレートからフック文を生成する
 * キャプション生成と同じフックテンプレートを流用
 * @param hookType - フック類型
 * @param genre - ジャンル
 * @param theme - テーマ
 * @param keywords - キーワード
 * @returns フック文
 */
function generateHookText(
  hookType: HookType,
  genre: Genre,
  theme: string,
  keywords: string[],
): string {
  // フックテンプレートをフィルタ
  const candidates = hookTemplates.filter(
    (t) =>
      t.hookType === hookType &&
      (t.genres === 'all' || t.genres.includes(genre)),
  );

  const template = candidates.length > 0
    ? pick(candidates)
    : pick(hookTemplates.filter((t) => t.hookType === hookType));

  const keyword = keywords.length > 0 ? pick(keywords) : theme;
  const numbers = [3, 5, 7, 10];
  const number = pick(numbers);

  return template.template
    .replace(/{keyword}/g, keyword)
    .replace(/{number}/g, String(number))
    .replace(/{genre}/g, genreToJapanese(genre))
    .replace(/{theme}/g, theme);
}

// ============================================================
// 時間配分
// ============================================================

/**
 * フックの持続時間を取得する（冒頭3秒がデフォルト）
 * @param totalDuration - 全体の秒数
 * @returns フックの秒数
 */
function getHookDuration(totalDuration: number): number {
  if (totalDuration <= 15) return 2;
  if (totalDuration <= 30) return 3;
  return 3;
}

/**
 * CTAの持続時間を取得する
 * @param totalDuration - 全体の秒数
 * @returns CTAの秒数
 */
function getCtaDuration(totalDuration: number): number {
  if (totalDuration <= 15) return 2;
  if (totalDuration <= 30) return 3;
  if (totalDuration <= 60) return 5;
  return 7;
}

// ============================================================
// 映像指示生成
// ============================================================

/**
 * ジャンルと候補から映像指示を生成する
 * @param genre - ジャンル
 * @param suggestions - テンプレートの推奨映像指示
 * @returns 映像指示テキスト
 */
function getVisualNote(genre: Genre, suggestions: string[]): string {
  const genrePatterns = genreVisualPatterns[genre];

  // テンプレート推奨とジャンル推奨の重複を優先
  const preferred = suggestions.filter((s) =>
    genrePatterns.primaryVisuals.includes(s as any),
  );

  const visual = preferred.length > 0 ? pick(preferred) : pick(suggestions);

  // ジャンル固有のtipsを付与
  return `${visual} - ${genrePatterns.tips}`;
}

// ============================================================
// BGM提案
// ============================================================

/**
 * ジャンルとスタイルからBGM提案を取得する
 * @param genre - ジャンル
 * @param style - リールスタイル
 * @returns BGM提案テキスト
 */
function getMusicSuggestion(genre: Genre, style: ReelStyle): string {
  const suggestion = musicSuggestions[genre]?.[style];
  if (!suggestion) {
    return 'テンポの良いポップ系BGMがおすすめ';
  }
  return `${suggestion.mood}: ${suggestion.description}`;
}

// ============================================================
// キャプション生成
// ============================================================

/**
 * リール投稿用のキャプションを生成する
 * @param theme - テーマ
 * @param keywords - キーワード
 * @param style - リールスタイル
 * @returns キャプション文
 */
function generateCaption(
  theme: string,
  keywords: string[],
  style: ReelStyle,
): string {
  const keyword = keywords.length > 0 ? keywords.join('・') : theme;

  const captionPatterns: Record<ReelStyle, string[]> = {
    '教育': [
      `${theme}について、知っておくべきことをまとめました。\n\n${keyword}のポイントを解説してます。\n\n保存して見返してね！`,
      `${theme}の正しいやり方、知ってますか？\n\n${keyword}について詳しく解説！\n\nためになったらいいね＆保存お願いします。`,
    ],
    'ストーリー': [
      `${theme}の体験談を話しました。\n\n${keyword}で学んだこと、共有します。\n\n同じ経験がある人はコメントで教えてね。`,
      `${theme}での経験をリアルに語りました。\n\n${keyword}の大切さに気づいた話。\n\n共感したらシェアしてね。`,
    ],
    'ビフォーアフター': [
      `${theme}のビフォーアフター。\n\n${keyword}を続けた結果がこちら。\n\nみんなも一緒に頑張ろう！`,
      `${theme}を始める前と後の変化を公開。\n\n${keyword}の効果を実感しています。\n\n変化を始めたい人はフォローしてね。`,
    ],
    'リスト': [
      `${theme}のポイントをリストアップ！\n\n${keyword}に関する大事なこと、全部まとめました。\n\n保存して何度も見返してね。`,
      `${theme}でやるべきことリスト。\n\n${keyword}を押さえておけば大丈夫。\n\n他にも知りたい人はフォローしてね。`,
    ],
    'チュートリアル': [
      `${theme}のやり方を手順で解説！\n\n${keyword}を使った方法を紹介してます。\n\nやってみた人はコメントで教えてね。`,
      `${theme}のチュートリアル動画。\n\n${keyword}のコツも紹介してます。\n\n保存して実践してみてね！`,
    ],
  };

  const patterns = captionPatterns[style] ?? captionPatterns['教育'];
  return pick(patterns);
}

// ============================================================
// 変数置換
// ============================================================

/**
 * テンプレート文字列の変数を置換する
 * @param template - テンプレート文字列
 * @param theme - テーマ
 * @param keywords - キーワード配列
 * @returns 置換後の文字列
 */
function replaceVariables(
  template: string,
  theme: string,
  keywords: string[],
): string {
  const keyword = keywords.length > 0 ? pick(keywords) : theme;
  return template
    .replace(/{theme}/g, theme)
    .replace(/{keyword}/g, keyword);
}

// ============================================================
// ユーティリティ
// ============================================================

/**
 * 配列からランダムに1つ選択する
 * @param arr - 選択対象の配列
 * @returns ランダムに選ばれた要素
 */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 一意IDを生成する
 * @returns 一意な文字列ID
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
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
