// ============================================================
// バイオテンプレートデータ
// ジャンル x トーン x パターン のテンプレート定義
// CTA種別ごとのテンプレート、絵文字パターンも含む
// ============================================================

import type { Genre } from "@/lib/types";

// バイオのトーン
export type BioTone =
  | "プロフェッショナル"
  | "フレンドリー"
  | "インスピレーション"
  | "ユーモア";

// バイオのCTA種別
export type BioCTAType = "リンク誘導" | "DM誘導" | "フォロー訴求";

// バイオの構造パターン
export type BioPattern = "authority" | "empathy" | "vision";

// テンプレートエントリ
export interface BioTemplateEntry {
  pattern: BioPattern;
  tone: BioTone;
  template: string; // {name}, {usp}, {targetAudience} で置換
  psychologyNote: string; // この構造を選んだ行動科学的理由
}

// CTAテンプレートエントリ
export interface BioCTATemplate {
  ctaType: BioCTAType;
  templates: string[];
  psychologyNote: string;
}

// ============================================================
// パターン説明
// ============================================================

export const patternDescriptions: Record<
  BioPattern,
  { name: string; structure: string }
> = {
  authority: {
    name: "権威型",
    structure: "実績/権威 → USP → ターゲット → CTA",
  },
  empathy: {
    name: "共感型",
    structure: "共感/問題提起 → 解決策(USP) → メリット → CTA",
  },
  vision: {
    name: "ビジョン型",
    structure: "ビジョン → USP → 実績 → CTA",
  },
};

// ============================================================
// バイオテンプレート（トーン別 x パターン別）
// ============================================================

export const bioTemplates: BioTemplateEntry[] = [
  // ── 権威型（Authority）──────────────────────

  // プロフェッショナル
  {
    pattern: "authority",
    tone: "プロフェッショナル",
    template:
      "{usp}の専門家\n{targetAudience}に向けて発信中\n{name}が厳選した情報をお届け",
    psychologyNote:
      "【権威性+社会的証明】専門家ポジションを明示することで信頼性を構築。ターゲット明示でアイデンティティバイアスを活用。",
  },
  {
    pattern: "authority",
    tone: "フレンドリー",
    template:
      "{name}です!\n{usp}についてわかりやすく発信中\n{targetAudience}のみんな集まれ~",
    psychologyNote:
      "【権威性+返報性】親しみやすい口調で権威性を和らげつつ、ターゲットに帰属意識を持たせる。",
  },
  {
    pattern: "authority",
    tone: "インスピレーション",
    template:
      "{usp}で人生を変えた{name}\n{targetAudience}の可能性を広げたい\n毎日がもっと輝く情報を発信",
    psychologyNote:
      "【権威性+ストーリーバイアス】実体験ベースの権威性で説得力を高め、ビジョンで共感を誘う。",
  },
  {
    pattern: "authority",
    tone: "ユーモア",
    template:
      "{usp}オタクの{name}\nガチで役立つ情報だけ発信してます\n{targetAudience}は見なきゃ損",
    psychologyNote:
      "【権威性+損失回避】ユーモラスな自己紹介で親近感を作りつつ、損失回避で行動を促す。",
  },

  // ── 共感型（Empathy）────────────────────────

  {
    pattern: "empathy",
    tone: "プロフェッショナル",
    template:
      "{targetAudience}の悩みを解決\n{usp}で確実に成果を出す方法\n{name}が毎日発信中",
    psychologyNote:
      "【共感+返報性】ターゲットの悩みに寄り添い、解決策を無料で提供する姿勢が返報性を刺激。",
  },
  {
    pattern: "empathy",
    tone: "フレンドリー",
    template:
      "{targetAudience}のあなたへ\n{usp}で毎日がもっとラクになる!\n{name}と一緒に頑張ろう",
    psychologyNote:
      "【共感+アイデンティティバイアス】直接語りかけることで自分事化を促進。仲間意識で継続フォローを狙う。",
  },
  {
    pattern: "empathy",
    tone: "インスピレーション",
    template:
      "かつて{targetAudience}と同じ悩みを抱えていた{name}\n{usp}との出会いで全てが変わった\nあなたにもきっとできる",
    psychologyNote:
      "【共感+ストーリーバイアス】ビフォーアフターのストーリーで感情移入を促し、行動変容を後押し。",
  },
  {
    pattern: "empathy",
    tone: "ユーモア",
    template:
      "{targetAudience}あるある、わかりすぎる\n{usp}で解決できるって知ってた?\n{name}がゆるく教えます",
    psychologyNote:
      "【共感+好奇心ギャップ】あるあるネタで共感を得つつ、解決策への好奇心を刺激。",
  },

  // ── ビジョン型（Vision）─────────────────────

  {
    pattern: "vision",
    tone: "プロフェッショナル",
    template:
      "{usp}で{targetAudience}の未来を変える\n実績に基づく確かな情報を発信\n{name}",
    psychologyNote:
      "【ビジョン+権威性】理想の未来を提示し、実績で裏付けることで信頼と期待を同時に構築。",
  },
  {
    pattern: "vision",
    tone: "フレンドリー",
    template:
      "{targetAudience}がもっと楽しくなる世界を目指して\n{name}が{usp}を毎日シェア!\nフォローして一緒に成長しよう",
    psychologyNote:
      "【ビジョン+返報性】共創の姿勢を見せることで、フォローという小さなコミットメントを引き出す。",
  },
  {
    pattern: "vision",
    tone: "インスピレーション",
    template:
      "{usp}の力を信じている\n{targetAudience}の人生がもっと豊かになるように\n{name}が全力で発信します",
    psychologyNote:
      "【ビジョン+コミットメント】熱い信念を表明することで共感者を集め、フォローのコミットメントを促す。",
  },
  {
    pattern: "vision",
    tone: "ユーモア",
    template:
      "{usp}の楽しさを広めたい{name}\n{targetAudience}にとって最高のアカウントを目指してる(自称)\n役立つ情報をゆるく発信中",
    psychologyNote:
      "【ビジョン+好奇心ギャップ】自虐的ユーモアで親近感を作り、コンテンツへの期待値を上げる。",
  },
];

// ============================================================
// CTAテンプレート
// ============================================================

export const bioCTATemplates: BioCTATemplate[] = [
  {
    ctaType: "リンク誘導",
    templates: [
      "詳しくはリンクから",
      "リンクから無料で受け取れます",
      "プロフまとめはリンクへ",
      "全コンテンツはリンクから",
    ],
    psychologyNote:
      "【好奇心ギャップ】リンク先の情報に対する好奇心を刺激し、クリックを促進。",
  },
  {
    ctaType: "DM誘導",
    templates: [
      "お気軽にDMください",
      "質問はDMへどうぞ",
      "DMで「○○」と送ってね",
      "相談はDMで受付中",
    ],
    psychologyNote:
      "【返報性+コミットメント】直接的なコミュニケーション導線を作り、関係構築の第一歩を促す。",
  },
  {
    ctaType: "フォロー訴求",
    templates: [
      "フォローで毎日お届け",
      "フォローして見逃さないでね",
      "フォローすると役立つ情報が届きます",
      "フォローして一緒に成長しよう",
    ],
    psychologyNote:
      "【損失回避+返報性】フォローしないことで有益な情報を逃す損失を暗示し、行動を促す。",
  },
];

// ============================================================
// ジャンル別絵文字パターン
// ============================================================

export const genreEmojis: Record<Genre, string[]> = {
  fitness: ["💪", "🏋️", "🔥", "🏃", "💯"],
  food: ["🍳", "🥗", "🍽️", "👨‍🍳", "✨"],
  travel: ["✈️", "🌍", "📸", "🗺️", "🌅"],
  beauty: ["💄", "✨", "🪞", "💅", "🌸"],
  business: ["💼", "📈", "💰", "🚀", "🎯"],
  lifestyle: ["🌿", "☕", "🏠", "✨", "🌱"],
  tech: ["💻", "⚡", "🔧", "🤖", "📱"],
  education: ["📚", "✏️", "🎓", "💡", "📝"],
  fashion: ["👗", "👠", "🎀", "💎", "🛍️"],
  photography: ["📷", "🎨", "🌄", "📸", "🖼️"],
};
