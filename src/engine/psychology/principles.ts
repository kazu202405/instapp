// ============================================================
// 行動科学原理マッピング
// Instagram成長戦略に活用する心理学原理の定義
// ============================================================

/**
 * 心理原理インターフェース
 * アプリ全体で使用される行動科学の原理を定義する
 */
export interface PsychologyPrinciple {
  id: string;
  name: string;        // 日本語名
  nameEn: string;      // 英語名
  description: string; // 原理の説明
  application: string; // Instagram活用法
}

/**
 * 行動科学原理マスターマップ
 * 各原理はフック生成、CTA選択、プロフィール最適化等で参照される
 */
export const principles: Record<string, PsychologyPrinciple> = {
  curiosityGap: {
    id: 'curiosityGap',
    name: '好奇心ギャップ',
    nameEn: 'Curiosity Gap',
    description: '知識のギャップを感じると、人は情報を求めずにいられない',
    application: 'フックで「続きが気になる」状態を作り、最後まで読ませる',
  },
  socialProof: {
    id: 'socialProof',
    name: '社会的証明',
    nameEn: 'Social Proof',
    description: '他者の行動を参考にして自分の判断を行う傾向',
    application: '数字や実績を示して信頼性を高め、フォローを促す',
  },
  lossAversion: {
    id: 'lossAversion',
    name: '損失回避',
    nameEn: 'Loss Aversion',
    description: '人は得をするより損を避けることに強く動機づけられる',
    application: '「知らないと損する」フレームで保存アクションを促す',
  },
  reciprocity: {
    id: 'reciprocity',
    name: '返報性',
    nameEn: 'Reciprocity',
    description: '何かを受け取ると返したくなる心理',
    application: '有益な情報を無料で提供し、フォローやシェアを促す',
  },
  scarcity: {
    id: 'scarcity',
    name: '希少性',
    nameEn: 'Scarcity',
    description: '限られたものに価値を感じる傾向',
    application: '限定感を演出して即座のアクションを促す',
  },
  identityBias: {
    id: 'identityBias',
    name: 'アイデンティティバイアス',
    nameEn: 'Identity Bias',
    description: '自分のアイデンティティに合致する情報を好む',
    application: 'ターゲット層の自己認識に響くフレーミングで共感を作る',
  },
  storyBias: {
    id: 'storyBias',
    name: 'ストーリーバイアス',
    nameEn: 'Story Bias',
    description: 'ストーリー形式の情報は記憶に残りやすい',
    application: '体験談やビフォーアフターで印象に残る投稿を作る',
  },
  anchoring: {
    id: 'anchoring',
    name: 'アンカリング効果',
    nameEn: 'Anchoring Effect',
    description: '最初に提示された数値が判断基準になる',
    application: '印象的な数字をフックに使い、注目を集める',
  },
  endowmentEffect: {
    id: 'endowmentEffect',
    name: '保有効果',
    nameEn: 'Endowment Effect',
    description: '一度手にしたものを手放したくない心理',
    application: '「保存して後で使える」価値を強調して保存を促す',
  },
  zeigarnikEffect: {
    id: 'zeigarnikEffect',
    name: 'ツァイガルニク効果',
    nameEn: 'Zeigarnik Effect',
    description: '未完了のタスクは完了したものより記憶に残る',
    application: 'カルーセルで「続きを見る」欲求を刺激する',
  },
} as const;

/**
 * フック類型と心理原理のマッピング
 * 各フック類型がどの心理原理を活用しているかを定義
 */
export const hookPrincipleMap: Record<string, string[]> = {
  curiosity: ['curiosityGap', 'zeigarnikEffect'],
  controversy: ['identityBias', 'socialProof'],
  story: ['storyBias', 'reciprocity'],
  number: ['anchoring', 'socialProof'],
  question: ['curiosityGap', 'identityBias'],
  shock: ['curiosityGap', 'lossAversion'],
};

/**
 * ターゲットアクションと心理原理のマッピング
 * 各目標アクションに有効な心理原理を定義
 */
export const actionPrincipleMap: Record<string, string[]> = {
  save: ['endowmentEffect', 'lossAversion', 'reciprocity'],
  share: ['socialProof', 'identityBias', 'reciprocity'],
  comment: ['curiosityGap', 'identityBias', 'socialProof'],
  follow: ['reciprocity', 'socialProof', 'scarcity'],
  click: ['curiosityGap', 'scarcity', 'lossAversion'],
};

/**
 * 指定した心理原理の情報を取得する
 * @param principleId - 原理ID
 * @returns 原理情報。見つからない場合はundefined
 */
export function getPrinciple(principleId: string): PsychologyPrinciple | undefined {
  return principles[principleId];
}

/**
 * フック類型に関連する心理原理一覧を取得する
 * @param hookType - フック類型
 * @returns 関連する心理原理の配列
 */
export function getPrinciplesForHook(hookType: string): PsychologyPrinciple[] {
  const principleIds = hookPrincipleMap[hookType] ?? [];
  return principleIds
    .map((id) => principles[id])
    .filter((p): p is PsychologyPrinciple => p !== undefined);
}

/**
 * ターゲットアクションに関連する心理原理一覧を取得する
 * @param action - ターゲットアクション
 * @returns 関連する心理原理の配列
 */
export function getPrinciplesForAction(action: string): PsychologyPrinciple[] {
  const principleIds = actionPrincipleMap[action] ?? [];
  return principleIds
    .map((id) => principles[id])
    .filter((p): p is PsychologyPrinciple => p !== undefined);
}
