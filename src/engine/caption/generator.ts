// ============================================================
// キャプション生成エンジン
// テンプレートベースの4幕構造キャプション生成
// フック → ストーリー → 価値提供 → CTA
// ============================================================

import type {
  CaptionInput,
  GeneratedCaption,
  StoryStructure,
  Genre,
  HookType,
  TargetAction,
} from '@/lib/types';
import {
  hookTemplates,
  storyTemplates,
  ctaTemplates,
  hookEmojis,
  ctaEmojis,
  emojiSeparators,
  type HookTemplate,
  type StoryTemplate,
  type CTATemplate,
} from '@/data/templates';
import { hookPrincipleMap, principles } from '@/engine/psychology/principles';
import { selectHashtags } from '@/engine/hashtag/strategy';

// ============================================================
// メイン生成関数
// ============================================================

/**
 * キャプションを生成する
 * テンプレート選択 → 変数置換 → バリエーション付与 → 組み立て
 * @param input - キャプション生成入力
 * @returns 生成されたキャプション
 */
export function generateCaption(input: CaptionInput): GeneratedCaption {
  const { genre, theme, keywords, targetAction, hookType, includeEmoji } = input;

  // 1. フック選択・生成
  const hookResult = selectHook(hookType, genre, keywords, theme);

  // 2. ストーリー構造選択
  const structure = selectStoryStructure(targetAction, genre);

  // 3. ストーリー本文生成
  const storyBody = generateStoryBody(structure, theme, keywords, genre);

  // 4. 価値提供文生成
  const valueText = generateValueText(structure, theme, keywords);

  // 5. CTA生成
  const ctaResult = generateCTA(targetAction, genre);

  // 6. バリエーション付与
  const finalHook = addVariation(hookResult.hook, includeEmoji, hookType);
  const finalStory = addVariation(storyBody, includeEmoji);
  const finalValue = addVariation(valueText, includeEmoji);
  const finalCta = addVariation(ctaResult.cta, includeEmoji, undefined, targetAction);

  // 7. ハッシュタグ生成
  const hashtagResult = selectHashtags(genre, keywords, theme);

  // 8. 区切り線選択
  const separator = includeEmoji
    ? pick(emojiSeparators)
    : '\n';

  // 9. 全文組み立て
  const fullCaption = assembleCaption(
    finalHook,
    finalStory,
    finalValue,
    finalCta,
    hashtagResult.hashtags,
    separator,
  );

  // 10. 心理原理理由の生成
  const hookReason = generateHookReason(hookType, hookResult.reason);
  const ctaReason = ctaResult.reason;

  // 11. 一意ID生成
  const id = generateId();

  return {
    id,
    hook: finalHook,
    story: finalStory,
    value: finalValue,
    cta: finalCta,
    fullCaption,
    hashtags: hashtagResult.hashtags,
    hookReason,
    ctaReason,
    storyStructure: structure.structure,
    input,
    createdAt: new Date().toISOString(),
  };
}

// ============================================================
// フック選択
// ============================================================

/**
 * フックテンプレートを選択し、変数を置換する
 * @param hookType - フック類型
 * @param genre - ジャンル
 * @param keywords - キーワード配列
 * @param theme - テーマ
 * @returns フック文と理由
 */
function selectHook(
  hookType: HookType,
  genre: Genre,
  keywords: string[],
  theme: string,
): { hook: string; reason: string } {
  // 該当フック類型のテンプレートをフィルタ
  const candidates = hookTemplates.filter(
    (t) =>
      t.hookType === hookType &&
      (t.genres === 'all' || t.genres.includes(genre)),
  );

  // テンプレートが見つからない場合はフォールバック
  const template: HookTemplate =
    candidates.length > 0
      ? pick(candidates)
      : pick(hookTemplates.filter((t) => t.hookType === hookType));

  // キーワード置換
  const keyword = keywords.length > 0 ? pick(keywords) : theme;
  const numbers = [3, 5, 7, 10, 30, 50, 100];
  const number = pick(numbers);

  let hook = template.template
    .replace(/{keyword}/g, keyword)
    .replace(/{number}/g, String(number))
    .replace(/{genre}/g, genreToJapanese(genre))
    .replace(/{theme}/g, theme);

  return { hook, reason: template.reason };
}

// ============================================================
// ストーリー構造選択
// ============================================================

/**
 * ターゲットアクションに最適なストーリー構造を選択する
 * @param targetAction - 狙うアクション
 * @param genre - ジャンル
 * @returns ストーリーテンプレート
 */
function selectStoryStructure(
  targetAction: TargetAction,
  _genre: Genre,
): StoryTemplate {
  // ターゲットアクションに適合する構造を優先
  const matching = storyTemplates.filter((t) =>
    t.targetActions.includes(targetAction),
  );

  if (matching.length > 0) {
    return pick(matching);
  }

  // マッチしない場合は教育型をデフォルト
  return storyTemplates[0];
}

// ============================================================
// ストーリー本文生成
// ============================================================

/**
 * ストーリーテンプレートに変数を埋め込んで本文を生成する
 * @param structure - ストーリー構造テンプレート
 * @param theme - テーマ
 * @param keywords - キーワード配列
 * @param genre - ジャンル
 * @returns 生成された本文
 */
function generateStoryBody(
  structure: StoryTemplate,
  theme: string,
  keywords: string[],
  _genre: Genre,
): string {
  const keyword = keywords.length > 0 ? pick(keywords) : theme;
  const number = pick([3, 5, 7]);

  return structure.bodyTemplate
    .replace(/{keyword}/g, keyword)
    .replace(/{theme}/g, theme)
    .replace(/{number}/g, String(number));
}

// ============================================================
// 価値提供文生成
// ============================================================

/**
 * ストーリー構造に合った価値提供テキストを生成する
 * @param structure - ストーリー構造テンプレート
 * @param theme - テーマ
 * @param keywords - キーワード配列
 * @returns 価値提供テキスト
 */
function generateValueText(
  structure: StoryTemplate,
  theme: string,
  keywords: string[],
): string {
  const keyword = keywords.length > 0 ? pick(keywords) : theme;
  const number = pick([3, 5, 7]);

  return structure.valueTemplate
    .replace(/{keyword}/g, keyword)
    .replace(/{theme}/g, theme)
    .replace(/{number}/g, String(number));
}

// ============================================================
// CTA生成
// ============================================================

/**
 * ターゲットアクションに適したCTAを選択する
 * @param targetAction - 狙うアクション
 * @param genre - ジャンル
 * @returns CTA文と理由
 */
function generateCTA(
  targetAction: TargetAction,
  _genre: Genre,
): { cta: string; reason: string } {
  const candidates = ctaTemplates.filter(
    (t) => t.targetAction === targetAction,
  );

  const template: CTATemplate =
    candidates.length > 0 ? pick(candidates) : pick(ctaTemplates);

  return { cta: template.template, reason: template.reason };
}

// ============================================================
// バリエーション付与
// ============================================================

/**
 * テキストに微妙なバリエーションを加える
 * 同じテンプレートでも毎回少し異なる出力を生成する
 * @param text - 元テキスト
 * @param includeEmoji - 絵文字を含めるか
 * @param hookType - フック類型（絵文字選択用、省略可）
 * @param targetAction - ターゲットアクション（CTA絵文字用、省略可）
 * @returns バリエーション付きテキスト
 */
function addVariation(
  text: string,
  includeEmoji: boolean,
  hookType?: HookType,
  targetAction?: TargetAction,
): string {
  let result = text;

  // 同義語置換（日本語の微妙なニュアンス差）
  const synonymMap: [RegExp, string[]][] = [
    [/大切/g, ['大切', '重要', '大事']],
    [/すごく/g, ['すごく', 'とても', 'めちゃくちゃ', '本当に']],
    [/たくさん/g, ['たくさん', '多くの', 'いっぱい']],
    [/簡単/g, ['簡単', 'シンプル', 'カンタン']],
    [/方法/g, ['方法', 'やり方', 'テクニック', 'コツ']],
  ];

  for (const [pattern, synonyms] of synonymMap) {
    if (pattern.test(result)) {
      const replacement = pick(synonyms);
      result = result.replace(pattern, replacement);
      // 同義語置換はグローバルに1回のみ行う（統一感のため）
      break;
    }
  }

  // 絵文字付与
  if (includeEmoji) {
    if (hookType && hookEmojis[hookType]) {
      const emoji = pick(hookEmojis[hookType]);
      result = `${emoji} ${result}`;
    } else if (targetAction && ctaEmojis[targetAction]) {
      const emoji = pick(ctaEmojis[targetAction]);
      result = `${emoji} ${result}`;
    }
  }

  return result;
}

// ============================================================
// 組み立て
// ============================================================

/**
 * 各パートを組み合わせて完成キャプションを作成する
 * @param hook - フック文
 * @param story - ストーリー本文
 * @param value - 価値提供文
 * @param cta - CTA文
 * @param hashtags - ハッシュタグ配列
 * @param separator - セクション区切り文字
 * @returns 完成キャプション文字列
 */
function assembleCaption(
  hook: string,
  story: string,
  value: string,
  cta: string,
  hashtags: string[],
  separator: string,
): string {
  const parts = [
    hook,
    separator,
    story,
    separator,
    value,
    separator,
    cta,
    '',
    hashtags.join(' '),
  ];

  return parts.join('\n\n');
}

// ============================================================
// 心理原理理由生成
// ============================================================

/**
 * フック選択の心理原理的理由を生成する
 * @param hookType - フック類型
 * @param templateReason - テンプレートに紐づく理由
 * @returns 心理原理を含む理由文
 */
function generateHookReason(hookType: HookType, templateReason: string): string {
  const principleIds = hookPrincipleMap[hookType] ?? [];
  const principleNames = principleIds
    .map((id) => principles[id]?.name)
    .filter(Boolean);

  if (principleNames.length === 0) {
    return templateReason;
  }

  return `【${principleNames.join('・')}】${templateReason}`;
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
 * crypto.randomUUID が使えない環境ではタイムスタンプベースにフォールバック
 * @returns 一意な文字列ID
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // フォールバック: タイムスタンプ + ランダム文字列
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

// ============================================================
// 複数バリエーション生成
// ============================================================

/**
 * 3つのバリエーションを同時生成する
 * 同じ入力から異なるテンプレート選択・バリエーション付与で複数候補を作成
 * @param input - キャプション生成入力
 * @param count - 生成するバリエーション数（デフォルト: 3）
 * @returns 生成されたキャプション配列
 */
export function generateCaptionVariants(input: CaptionInput, count: number = 3): GeneratedCaption[] {
  const variants: GeneratedCaption[] = [];
  for (let i = 0; i < count; i++) {
    variants.push(generateCaption(input));
  }
  return variants;
}
