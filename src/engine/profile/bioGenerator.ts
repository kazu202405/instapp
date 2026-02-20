// ============================================================
// バイオ生成エンジン
// 行動科学ベースのInstagramプロフィール文自動生成
// 3つの構造パターン x 4つのトーンでバリエーション生成
// ============================================================

import type { Genre } from "@/lib/types";
import {
  bioTemplates,
  bioCTATemplates,
  genreEmojis,
  patternDescriptions,
  type BioTone,
  type BioCTAType,
  type BioPattern,
  type BioTemplateEntry,
} from "@/data/bioTemplates";

// ============================================================
// 型定義
// ============================================================

/** バイオ生成の入力 */
export interface BioInput {
  genre: Genre;
  name: string; // アカウント名/ニックネーム
  usp: string; // 独自の強み（ユニークセリングポイント）
  targetAudience: string; // ターゲット層
  tone: BioTone;
  includeCta: boolean; // CTAを含めるか
  ctaType?: BioCTAType; // CTA種別
}

/** 生成されたバイオ */
export interface GeneratedBio {
  id: string;
  text: string; // 150文字以内のバイオテキスト
  characterCount: number;
  psychologyNote: string; // なぜこの構成にしたか
  patternName: string; // パターン名（表示用）
  input: BioInput;
  createdAt: string;
}

// ============================================================
// メイン生成関数
// ============================================================

/**
 * 3つの構造パターンでバイオバリエーションを生成する
 * パターンA: 権威型（実績/権威 → USP → ターゲット → CTA）
 * パターンB: 共感型（共感/問題提起 → 解決策 → メリット → CTA）
 * パターンC: ビジョン型（ビジョン → USP → 実績 → CTA）
 *
 * @param input - バイオ生成入力
 * @param count - 生成するバリエーション数（デフォルト: 3）
 * @returns 生成されたバイオ配列
 */
export function generateBioVariants(
  input: BioInput,
  count: number = 3
): GeneratedBio[] {
  const patterns: BioPattern[] = ["authority", "empathy", "vision"];
  const results: GeneratedBio[] = [];

  // 各パターンからバリエーション生成
  for (let i = 0; i < Math.min(count, patterns.length); i++) {
    const pattern = patterns[i];
    const bio = generateSingleBio(input, pattern);
    results.push(bio);
  }

  // count > 3 の場合はランダムにパターンを繰り返す
  for (let i = patterns.length; i < count; i++) {
    const pattern = pick(patterns);
    const bio = generateSingleBio(input, pattern);
    results.push(bio);
  }

  return results;
}

// ============================================================
// 単一バイオ生成
// ============================================================

/**
 * 指定パターンで1つのバイオを生成する
 * @param input - バイオ生成入力
 * @param pattern - 構造パターン
 * @returns 生成されたバイオ
 */
function generateSingleBio(input: BioInput, pattern: BioPattern): GeneratedBio {
  const { genre, name, usp, targetAudience, tone, includeCta, ctaType } = input;

  // 1. テンプレート選択
  const template = selectTemplate(pattern, tone);

  // 2. 変数置換
  let bioText = replaceVariables(template.template, name, usp, targetAudience);

  // 3. 絵文字付与
  bioText = addGenreEmojis(bioText, genre);

  // 4. CTA追加
  let ctaPsychologyNote = "";
  if (includeCta && ctaType) {
    const ctaResult = addCTA(bioText, ctaType);
    bioText = ctaResult.text;
    ctaPsychologyNote = ctaResult.psychologyNote;
  }

  // 5. 150文字制限を適用
  bioText = enforceCharacterLimit(bioText, 150);

  // 6. 心理ノート生成
  const patternInfo = patternDescriptions[pattern];
  let psychologyNote = `【${patternInfo.name}】${patternInfo.structure}\n${template.psychologyNote}`;
  if (ctaPsychologyNote) {
    psychologyNote += `\n${ctaPsychologyNote}`;
  }

  return {
    id: generateId(),
    text: bioText,
    characterCount: bioText.length,
    psychologyNote,
    patternName: patternInfo.name,
    input,
    createdAt: new Date().toISOString(),
  };
}

// ============================================================
// テンプレート選択
// ============================================================

/**
 * パターンとトーンに合致するテンプレートを選択する
 * @param pattern - 構造パターン
 * @param tone - トーン
 * @returns 選択されたテンプレート
 */
function selectTemplate(
  pattern: BioPattern,
  tone: BioTone
): BioTemplateEntry {
  // 完全一致するテンプレートを検索
  const exactMatch = bioTemplates.filter(
    (t) => t.pattern === pattern && t.tone === tone
  );

  if (exactMatch.length > 0) {
    return pick(exactMatch);
  }

  // パターンだけで一致するテンプレートにフォールバック
  const patternMatch = bioTemplates.filter((t) => t.pattern === pattern);

  if (patternMatch.length > 0) {
    return pick(patternMatch);
  }

  // 最終フォールバック
  return bioTemplates[0];
}

// ============================================================
// 変数置換
// ============================================================

/**
 * テンプレート内のプレースホルダーを実際の値で置換する
 * @param template - テンプレート文字列
 * @param name - アカウント名
 * @param usp - 独自の強み
 * @param targetAudience - ターゲット層
 * @returns 置換済みテキスト
 */
function replaceVariables(
  template: string,
  name: string,
  usp: string,
  targetAudience: string
): string {
  return template
    .replace(/{name}/g, name)
    .replace(/{usp}/g, usp)
    .replace(/{targetAudience}/g, targetAudience);
}

// ============================================================
// 絵文字付与
// ============================================================

/**
 * ジャンルに応じた絵文字をバイオテキストに付与する
 * 各行の先頭に絵文字を追加（視覚的スキャナビリティ向上）
 * @param text - バイオテキスト
 * @param genre - ジャンル
 * @returns 絵文字付きテキスト
 */
function addGenreEmojis(text: string, genre: Genre): string {
  const emojis = genreEmojis[genre] ?? genreEmojis.lifestyle;
  const lines = text.split("\n");

  // 各行の先頭に異なる絵文字を追加
  const decoratedLines = lines.map((line, index) => {
    if (line.trim() === "") return line;
    const emoji = emojis[index % emojis.length];
    return `${emoji} ${line}`;
  });

  return decoratedLines.join("\n");
}

// ============================================================
// CTA追加
// ============================================================

/**
 * バイオテキストにCTAを追加する
 * @param text - バイオテキスト
 * @param ctaType - CTA種別
 * @returns CTA追加済みテキストと心理ノート
 */
function addCTA(
  text: string,
  ctaType: BioCTAType
): { text: string; psychologyNote: string } {
  const ctaTemplate = bioCTATemplates.find((t) => t.ctaType === ctaType);

  if (!ctaTemplate) {
    return { text, psychologyNote: "" };
  }

  const ctaText = pick(ctaTemplate.templates);

  // CTAアイコンの付与
  const ctaIcons: Record<BioCTAType, string> = {
    リンク誘導: "👇",
    DM誘導: "📩",
    フォロー訴求: "🔔",
  };

  const icon = ctaIcons[ctaType];
  const fullCta = `${icon} ${ctaText}`;

  return {
    text: `${text}\n${fullCta}`,
    psychologyNote: ctaTemplate.psychologyNote,
  };
}

// ============================================================
// 文字数制限
// ============================================================

/**
 * バイオテキストを指定文字数以内に収める
 * 超過する場合は末尾を切り詰めて「...」を付加
 * @param text - バイオテキスト
 * @param limit - 文字数上限
 * @returns 制限適用済みテキスト
 */
function enforceCharacterLimit(text: string, limit: number): string {
  if (text.length <= limit) {
    return text;
  }

  // 行単位で末尾から削除を試みる
  const lines = text.split("\n");
  let result = text;

  while (result.length > limit && lines.length > 1) {
    lines.pop();
    result = lines.join("\n");
  }

  // まだ超過している場合は文字レベルで切り詰め
  if (result.length > limit) {
    result = result.slice(0, limit - 1) + "…";
  }

  return result;
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
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
