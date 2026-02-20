// ============================================================
// プロフィール最適化チェッカーエンジン
// 6カテゴリ（名前SEO / バイオ / CTA / 写真 / ハイライト / ピン留め）
// 各項目に行動科学的理由を付与し、スコアリングする
// ============================================================

import type { ProfileCheckItem } from '@/lib/types';

// ============================================================
// チェック項目定義
// ============================================================

/**
 * プロフィール最適化チェック項目のマスターデータ
 * 各項目に重みと心理原理に基づく理由を設定
 */
const PROFILE_CHECK_ITEMS: Omit<ProfileCheckItem, 'completed'>[] = [
  // ──────────────────────────────
  // カテゴリ1: 名前SEO
  // ──────────────────────────────
  {
    id: 'name-keyword',
    category: 'name',
    label: '名前にキーワードを含める',
    description:
      'ユーザー名または名前欄に、ジャンルを表すキーワード（例: 「筋トレ」「レシピ」「旅行」）を含める。検索結果に表示されやすくなる。',
    psychologyReason:
      '【社会的証明】検索結果で表示されると「多くの人が見ているアカウント」という印象を与え、信頼性が向上する。名前にキーワードがあると「専門家」として認知されやすい。',
    weight: 8,
  },
  {
    id: 'name-readable',
    category: 'name',
    label: '覚えやすく読みやすい名前',
    description:
      '日本語で読みやすく、口頭で伝えても探せる名前にする。特殊文字や過度な装飾は避ける。',
    psychologyReason:
      '【処理流暢性】読みやすい名前は脳の処理負荷が低く、好印象を与える。認知負荷の低さが信頼感に直結する。',
    weight: 6,
  },

  // ──────────────────────────────
  // カテゴリ2: バイオ
  // ──────────────────────────────
  {
    id: 'bio-value-proposition',
    category: 'bio',
    label: '3秒で価値が伝わるバイオ',
    description:
      '最初の1行で「誰のための」「何を発信する」アカウントかを明確にする。訪問者は平均3秒でフォロー判断をする。',
    psychologyReason:
      '【初頭効果】最初に目にする情報が全体の印象を決定する。3秒以内に価値が伝わらないと離脱される。フォロー判断の80%はバイオの第一印象で決まる。',
    weight: 10,
  },
  {
    id: 'bio-numbers',
    category: 'bio',
    label: 'バイオに実績数字を含める',
    description:
      'フォロワー数、実績年数、達成数値など具体的な数字を含める。例:「3000人が実践中」「5年の実績」。',
    psychologyReason:
      '【アンカリング効果+社会的証明】具体的な数字は信頼の基準点（アンカー）を作り、「これだけの人が支持している」という社会的証明が追従行動を促す。',
    weight: 8,
  },
  {
    id: 'bio-target',
    category: 'bio',
    label: 'ターゲット層を明示する',
    description:
      '「〇〇な人のための」「〇〇に悩む方へ」のように、誰に向けたアカウントかを明記する。',
    psychologyReason:
      '【アイデンティティバイアス】「これは自分のためのアカウントだ」と認識させると、フォロー率が大幅に向上する。人は自分のアイデンティティに合致する情報源を好む。',
    weight: 9,
  },

  // ──────────────────────────────
  // カテゴリ3: CTA
  // ──────────────────────────────
  {
    id: 'cta-link',
    category: 'cta',
    label: 'プロフィールリンクを設定する',
    description:
      'リンクツリーや公式サイトなど、訪問者が次のアクションを取れるリンクを設置する。',
    psychologyReason:
      '【好奇心ギャップ+損失回避】「もっと知りたい」という好奇心の受け皿がないと機会損失になる。リンクがないプロフィールは、コンバージョンの導線が途切れる。',
    weight: 7,
  },
  {
    id: 'cta-action',
    category: 'cta',
    label: 'バイオにアクション誘導を含める',
    description:
      '「フォローして最新情報をGET」「下のリンクから無料で受け取る」などアクション指示を含める。',
    psychologyReason:
      '【デフォルト効果】明確な指示がないと人は行動しない。具体的なアクション指示（CTA）を提示すると行動率が2-3倍になる。',
    weight: 8,
  },

  // ──────────────────────────────
  // カテゴリ4: 写真
  // ──────────────────────────────
  {
    id: 'photo-professional',
    category: 'photo',
    label: 'プロフィール写真が鮮明',
    description:
      '顔写真またはブランドロゴが鮮明に表示されている。暗い写真、ぼやけた写真、小さすぎる写真は避ける。',
    psychologyReason:
      '【ハロー効果】見た目の第一印象が、コンテンツの品質評価にまで影響する。鮮明なプロフィール写真は「信頼できるアカウント」という印象を形成する。',
    weight: 7,
  },
  {
    id: 'photo-brand-consistency',
    category: 'photo',
    label: 'ブランドカラーとの一貫性',
    description:
      'プロフィール写真のトーンや色合いが、投稿全体のブランディングと一致している。',
    psychologyReason:
      '【単純接触効果】一貫したビジュアルに繰り返し接触すると好感度が上昇する。ブランドカラーの統一は、フィードを見た瞬間の「プロ感」を演出する。',
    weight: 5,
  },

  // ──────────────────────────────
  // カテゴリ5: ハイライト
  // ──────────────────────────────
  {
    id: 'highlights-categories',
    category: 'highlights',
    label: 'ハイライトをカテゴリ別に整理',
    description:
      '「自己紹介」「ノウハウ」「Q&A」「レビュー」など、訪問者が求める情報をカテゴリ別に整理する。',
    psychologyReason:
      '【選択アーキテクチャ】情報が整理されていると選択の負荷が下がり、閲覧行動が促進される。カオスなハイライトは認知負荷が高く、離脱の原因になる。',
    weight: 6,
  },
  {
    id: 'highlights-covers',
    category: 'highlights',
    label: 'ハイライトカバーを統一する',
    description:
      '全ハイライトのカバー画像をブランドカラーやデザインで統一する。視覚的な整合性を保つ。',
    psychologyReason:
      '【ゲシュタルト原理（類似の法則）】視覚的に統一された要素は「まとまり」として認知され、プロフェッショナルな印象を与える。ブランド信頼度の向上に直結する。',
    weight: 5,
  },

  // ──────────────────────────────
  // カテゴリ6: ピン留め投稿
  // ──────────────────────────────
  {
    id: 'pinned-best',
    category: 'pinned',
    label: 'ベスト投稿をピン留めする',
    description:
      'エンゲージメントが最も高かった投稿をピン留めする。新規訪問者に「最高のコンテンツ」を最初に見せる。',
    psychologyReason:
      '【初頭効果+ピークエンド効果】最初に高品質コンテンツを見せると、アカウント全体の評価が向上する。フォロー判断は最初に目にする投稿の品質で大きく左右される。',
    weight: 7,
  },
  {
    id: 'pinned-intro',
    category: 'pinned',
    label: '自己紹介投稿をピン留めする',
    description:
      '「何者なのか」「何を発信しているのか」「フォローするメリット」がわかる自己紹介投稿をピン留めする。',
    psychologyReason:
      '【返報性+アイデンティティバイアス】自己開示は信頼構築の第一歩。「この人は何者か」がわかると安心感が生まれ、フォローの心理的ハードルが下がる。',
    weight: 8,
  },
];

// ============================================================
// チェック項目取得
// ============================================================

/**
 * 全プロフィールチェック項目を取得する
 * 全項目のcompletedフラグはfalseで初期化される
 * @returns プロフィールチェック項目の配列
 */
export function getProfileCheckItems(): ProfileCheckItem[] {
  return PROFILE_CHECK_ITEMS.map((item) => ({
    ...item,
    completed: false,
  }));
}

// ============================================================
// スコア算出
// ============================================================

/**
 * チェック項目の完了状態からプロフィールスコアを算出する
 * @param items - チェック項目配列（completedフラグ付き）
 * @returns プロフィールスコア（0-100）
 */
export function calculateProfileScore(items: ProfileCheckItem[]): number {
  if (items.length === 0) return 0;

  // 全項目の重みの合計
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

  if (totalWeight === 0) return 0;

  // 完了項目の重み合計
  const completedWeight = items
    .filter((item) => item.completed)
    .reduce((sum, item) => sum + item.weight, 0);

  // パーセンテージを算出して0-100にスケーリング
  const rawScore = (completedWeight / totalWeight) * 100;

  return Math.round(rawScore);
}

// ============================================================
// 改善提案生成
// ============================================================

/**
 * 未完了のチェック項目から改善提案を生成する
 * 重みが高い項目（影響度が大きい項目）を優先
 * @param items - チェック項目配列（completedフラグ付き）
 * @returns 改善提案文字列の配列（最大5つ、重み順）
 */
export function getImprovementSuggestions(items: ProfileCheckItem[]): string[] {
  // 未完了項目を重みの降順でソート
  const incomplete = items
    .filter((item) => !item.completed)
    .sort((a, b) => b.weight - a.weight);

  if (incomplete.length === 0) {
    return ['全項目クリア！プロフィールは最適化されています。定期的に見直して最新の状態を維持しましょう。'];
  }

  // カテゴリ名の日本語マッピング
  const categoryNames: Record<string, string> = {
    name: '名前SEO',
    bio: 'バイオ',
    cta: 'CTA',
    photo: 'プロフィール写真',
    highlights: 'ハイライト',
    pinned: 'ピン留め投稿',
  };

  return incomplete.slice(0, 5).map((item) => {
    const categoryName = categoryNames[item.category] ?? item.category;
    return `【${categoryName}】${item.label} - ${item.description}（${item.psychologyReason}）`;
  });
}

// ============================================================
// カテゴリ別スコア
// ============================================================

/**
 * カテゴリ別のスコアを算出する
 * @param items - チェック項目配列
 * @returns カテゴリ名とスコアのレコード
 */
export function getCategoryScores(
  items: ProfileCheckItem[],
): Record<string, { score: number; total: number; completed: number }> {
  const categories = ['name', 'bio', 'cta', 'photo', 'highlights', 'pinned'] as const;

  const result: Record<string, { score: number; total: number; completed: number }> = {};

  for (const category of categories) {
    const categoryItems = items.filter((item) => item.category === category);
    const total = categoryItems.length;
    const completed = categoryItems.filter((item) => item.completed).length;
    const score = total > 0 ? Math.round((completed / total) * 100) : 0;

    result[category] = { score, total, completed };
  }

  return result;
}

// ============================================================
// 優先カテゴリ判定
// ============================================================

/**
 * 最も改善効果が高いカテゴリを判定する
 * 未完了項目の重みが最も大きいカテゴリを返す
 * @param items - チェック項目配列
 * @returns 優先的に改善すべきカテゴリ名と理由
 */
export function getPriorityCategory(
  items: ProfileCheckItem[],
): { category: string; reason: string } {
  const categoryNames: Record<string, string> = {
    name: '名前SEO',
    bio: 'バイオ',
    cta: 'CTA',
    photo: 'プロフィール写真',
    highlights: 'ハイライト',
    pinned: 'ピン留め投稿',
  };

  // カテゴリ別の未完了重みを集計
  const categoryWeights: Record<string, number> = {};

  for (const item of items) {
    if (!item.completed) {
      categoryWeights[item.category] =
        (categoryWeights[item.category] ?? 0) + item.weight;
    }
  }

  // 重みが最大のカテゴリを特定
  let maxCategory = '';
  let maxWeight = 0;

  for (const [category, weight] of Object.entries(categoryWeights)) {
    if (weight > maxWeight) {
      maxWeight = weight;
      maxCategory = category;
    }
  }

  if (!maxCategory) {
    return {
      category: 'none',
      reason: '全カテゴリが最適化されています。',
    };
  }

  const categoryName = categoryNames[maxCategory] ?? maxCategory;

  return {
    category: maxCategory,
    reason: `「${categoryName}」カテゴリの未完了項目の影響度が最も高いです（合計重み: ${maxWeight}）。ここを改善するとプロフィールスコアが最も効率的に向上します。`,
  };
}
