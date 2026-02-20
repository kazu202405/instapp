// ============================================================
// A/Bテスト仮説ビルダーエンジン
// 心理原理に基づく仮説テンプレートの提供と評価
// テスト設計 → 実行 → 評価 → 学習のサイクルを支援
// ============================================================

import type { ABTest } from '@/lib/types';

// ============================================================
// 仮説テンプレート型定義
// ============================================================

/**
 * 仮説テンプレート
 * 各テンプレートは心理原理に基づくA/B比較の設計図
 */
export interface HypothesisTemplate {
  id: string;
  principle: string;     // 心理原理名
  hypothesis: string;    // 仮説テンプレート文
  variableA: string;     // A案の説明
  variableB: string;     // B案の説明
  metric: string;        // 測定指標
}

// ============================================================
// テンプレートデータ
// ============================================================

/** 仮説テンプレート一覧 */
const HYPOTHESIS_TEMPLATES: HypothesisTemplate[] = [
  // 好奇心ギャップ vs 直接型フック
  {
    id: 'hook-curiosity-vs-direct',
    principle: '好奇心ギャップ',
    hypothesis:
      '好奇心ギャップを活用したフックは、直接的なフックよりもエンゲージメント率が高い',
    variableA: '好奇心ギャップ型フック（例: 「99%の人が知らない〇〇の裏ワザ」）',
    variableB: '直接型フック（例: 「〇〇の裏ワザを紹介します」）',
    metric: 'エンゲージメント率（いいね+コメント+保存+シェア / リーチ）',
  },

  // 質問CTA vs 命令CTA
  {
    id: 'cta-question-vs-command',
    principle: 'アイデンティティバイアス',
    hypothesis:
      '質問形式のCTAは、命令形式のCTAよりもコメント率が高い',
    variableA: '質問型CTA（例: 「あなたはどう思いますか？コメントで教えてね」）',
    variableB: '命令型CTA（例: 「今すぐコメントしてください」）',
    metric: 'コメント率（コメント数 / リーチ）',
  },

  // 絵文字多め vs 絵文字少なめ
  {
    id: 'emoji-heavy-vs-minimal',
    principle: '処理流暢性',
    hypothesis:
      '適度な絵文字使用は視認性を高め、エンゲージメントを向上させる',
    variableA: '絵文字多めキャプション（各セクションに2-3個の絵文字を配置）',
    variableB: '絵文字最小限キャプション（テキストのみ、区切り線のみ使用）',
    metric: 'エンゲージメント率',
  },

  // 短文キャプション vs 長文キャプション
  {
    id: 'caption-short-vs-long',
    principle: 'ツァイガルニク効果',
    hypothesis:
      '長文キャプションは保存率が高く、短文キャプションはシェア率が高い',
    variableA: '短文キャプション（100文字以内、要点のみ）',
    variableB: '長文キャプション（500文字以上、詳細な解説付き）',
    metric: '保存率 / シェア率',
  },

  // 一人称 vs 三人称
  {
    id: 'perspective-first-vs-third',
    principle: 'ストーリーバイアス',
    hypothesis:
      '一人称の体験談は共感を生みやすく、三人称の解説は権威性を高める',
    variableA: '一人称視点（例: 「私が実際にやってみた結果...」）',
    variableB: '三人称視点（例: 「成功者が実践している方法とは...」）',
    metric: 'コメント率 / フォロー転換率',
  },

  // 数字フック vs ストーリーフック
  {
    id: 'hook-number-vs-story',
    principle: 'アンカリング効果 vs ストーリーバイアス',
    hypothesis:
      '数字フックは即座の注目を集め、ストーリーフックは深い共感を生む',
    variableA: '数字型フック（例: 「たった3日で劇的に変わる方法」）',
    variableB: 'ストーリー型フック（例: 「〇〇に出会って人生が変わった話」）',
    metric: 'エンゲージメント率 / 保存率',
  },

  // 損失回避フレーム vs 利益フレーム
  {
    id: 'frame-loss-vs-gain',
    principle: '損失回避',
    hypothesis:
      '損失回避フレーミングは利益フレーミングよりも保存率が高い',
    variableA: '利益フレーム（例: 「これを知ると得します」）',
    variableB: '損失回避フレーム（例: 「これを知らないと損します」）',
    metric: '保存率',
  },

  // 社会的証明あり vs なし
  {
    id: 'social-proof-vs-none',
    principle: '社会的証明',
    hypothesis:
      '社会的証明を含むキャプションはフォロー転換率が高い',
    variableA: '社会的証明あり（例: 「3000人が実践中のメソッド」）',
    variableB: '社会的証明なし（例: 「効果的なメソッドを紹介」）',
    metric: 'フォロー転換率',
  },

  // カルーセル vs リール
  {
    id: 'format-carousel-vs-reel',
    principle: 'ツァイガルニク効果 vs 処理流暢性',
    hypothesis:
      'カルーセルは保存率が高く、リールはリーチ数が多い',
    variableA: 'カルーセル投稿（スライド形式で段階的に情報提供）',
    variableB: 'リール投稿（動画形式で同じ情報をテンポよく伝える）',
    metric: 'リーチ数 / 保存率',
  },

  // 朝投稿 vs 夜投稿
  {
    id: 'time-morning-vs-evening',
    principle: '認知負荷理論',
    hypothesis:
      '朝の投稿は教育系コンテンツの保存率が高く、夜の投稿はエンタメ系のエンゲージメントが高い',
    variableA: '朝投稿（7:00-9:00 JST）',
    variableB: '夜投稿（19:00-21:00 JST）',
    metric: '保存率 / エンゲージメント率',
  },

  // 保存CTA: 返報性 vs 損失回避
  {
    id: 'save-cta-reciprocity-vs-loss',
    principle: '返報性 vs 損失回避',
    hypothesis:
      '損失回避型の保存CTAは返報性型よりも保存率が高い',
    variableA: '返報性型CTA（例: 「後で見返せるように保存しておいてね」）',
    variableB: '損失回避型CTA（例: 「この情報、保存しないと絶対損します」）',
    metric: '保存率',
  },

  // 希少性あり vs なし
  {
    id: 'scarcity-vs-none',
    principle: '希少性',
    hypothesis:
      '限定感を演出したCTAはクリック率が高い',
    variableA: '希少性あり（例: 「今だけ限定で公開中」）',
    variableB: '通常表現（例: 「詳しくはリンクから」）',
    metric: 'プロフィールリンククリック率',
  },
];

// ============================================================
// テンプレート取得
// ============================================================

/**
 * 全仮説テンプレートを取得する
 * @returns 仮説テンプレートの配列
 */
export function getHypothesisTemplates(): HypothesisTemplate[] {
  return [...HYPOTHESIS_TEMPLATES];
}

/**
 * 指定IDの仮説テンプレートを取得する
 * @param templateId - テンプレートID
 * @returns テンプレート。見つからない場合はundefined
 */
export function getHypothesisTemplate(
  templateId: string,
): HypothesisTemplate | undefined {
  return HYPOTHESIS_TEMPLATES.find((t) => t.id === templateId);
}

// ============================================================
// A/Bテスト作成
// ============================================================

/**
 * テンプレートからA/Bテストを作成する
 * @param templateId - テンプレートID
 * @param customValues - カスタム値（部分的に上書き可能）
 * @returns 作成されたA/Bテスト
 * @throws テンプレートが見つからない場合はエラー
 */
export function createABTest(
  templateId: string,
  customValues?: Partial<ABTest>,
): ABTest {
  const template = HYPOTHESIS_TEMPLATES.find((t) => t.id === templateId);

  if (!template) {
    // フォールバック: カスタム値があればそれを使用
    if (customValues?.hypothesis) {
      const fallbackId = customValues.id ?? generateId();
      const base: ABTest = {
        id: fallbackId,
        hypothesis: customValues.hypothesis,
        psychologyPrinciple: customValues.psychologyPrinciple ?? '未指定',
        variableA: customValues.variableA ?? 'A案',
        variableB: customValues.variableB ?? 'B案',
        metric: customValues.metric ?? 'エンゲージメント率',
        learning: '',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      return { ...base, ...customValues, id: fallbackId };
    }

    throw new Error(`テンプレートが見つかりません: ${templateId}`);
  }

  const testId = customValues?.id ?? generateId();
  const base: ABTest = {
    id: testId,
    hypothesis: template.hypothesis,
    psychologyPrinciple: template.principle,
    variableA: template.variableA,
    variableB: template.variableB,
    metric: template.metric,
    learning: '',
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  // カスタム値で上書き（IDは保持）
  return { ...base, ...customValues, id: testId };
}

// ============================================================
// テスト結果評価
// ============================================================

/**
 * A/Bテストの結果を評価する
 *
 * 判定ロジック:
 * - 差異が10%未満: 統計的に有意差なし（引き分け）
 * - 差異が10-30%: 弱い有意差あり
 * - 差異が30%以上: 強い有意差あり
 *
 * @param test - 評価するA/Bテスト
 * @returns 勝者、信頼度、洞察
 */
export function evaluateTest(test: ABTest): {
  winner: 'A' | 'B' | null;
  confidence: string;
  insight: string;
} {
  // 結果が入力されていない場合
  if (test.resultA === undefined || test.resultB === undefined) {
    return {
      winner: null,
      confidence: '未評価',
      insight: 'テスト結果を入力してください。A案とB案それぞれの数値が必要です。',
    };
  }

  const resultA = test.resultA;
  const resultB = test.resultB;

  // どちらもゼロの場合
  if (resultA === 0 && resultB === 0) {
    return {
      winner: null,
      confidence: '評価不可',
      insight:
        '両方の結果が0です。テスト期間が短すぎるか、サンプルサイズが不足している可能性があります。最低でも各案3投稿、7日間以上のテスト期間を確保してください。',
    };
  }

  // 差異率を計算
  const maxValue = Math.max(resultA, resultB);
  const minValue = Math.min(resultA, resultB);
  const diffPercent = maxValue > 0 ? ((maxValue - minValue) / maxValue) * 100 : 0;

  // 勝者判定
  const winner: 'A' | 'B' | null =
    diffPercent < 10 ? null : resultA > resultB ? 'A' : 'B';

  // 信頼度判定
  let confidence: string;
  if (diffPercent < 10) {
    confidence = '有意差なし（差異10%未満）';
  } else if (diffPercent < 30) {
    confidence = '弱い有意差あり（差異10-30%）';
  } else {
    confidence = '強い有意差あり（差異30%以上）';
  }

  // 洞察生成
  const insight = generateInsight(test, winner, diffPercent);

  return { winner, confidence, insight };
}

// ============================================================
// 洞察生成
// ============================================================

/**
 * テスト結果から行動科学的洞察を生成する
 * @param test - A/Bテスト
 * @param winner - 勝者（null=引き分け）
 * @param diffPercent - 差異率
 * @returns 洞察文
 */
function generateInsight(
  test: ABTest,
  winner: 'A' | 'B' | null,
  diffPercent: number,
): string {
  const principle = test.psychologyPrinciple;
  const metric = test.metric;

  // 引き分けの場合
  if (winner === null) {
    return (
      `A案とB案で${metric}に大きな差は見られませんでした（差異${Math.round(diffPercent)}%）。` +
      `「${principle}」の効果は、このコンテキストでは限定的です。` +
      '別の変数（投稿時間、フォーマット、ターゲット層など）を変えてテストを継続しましょう。' +
      'サンプルサイズを増やすとより正確な判定ができます。'
    );
  }

  const winnerLabel = winner === 'A' ? 'A案' : 'B案';
  const winnerDesc = winner === 'A' ? test.variableA : test.variableB;
  const loserLabel = winner === 'A' ? 'B案' : 'A案';

  // 差異率に応じた表現
  const diffDescription =
    diffPercent >= 30
      ? `${Math.round(diffPercent)}%の大きな差`
      : `${Math.round(diffPercent)}%の差`;

  return (
    `${winnerLabel}が${loserLabel}に対して${metric}で${diffDescription}をつけて勝利しました。` +
    `「${principle}」の効果が確認できました。` +
    `勝因: ${winnerDesc} のアプローチがこのオーディエンスに効果的です。` +
    `次のステップとして、${winnerLabel}のアプローチをベースに、さらに細かい変数でテストを行うことをおすすめします。`
  );
}

// ============================================================
// 推奨テスト取得
// ============================================================

/**
 * 現在のパフォーマンス状況に基づいて推奨テストを返す
 * @param weakMetric - 弱点となっている指標名
 * @returns 推奨テンプレートの配列（最大3つ）
 */
export function getRecommendedTests(weakMetric: string): HypothesisTemplate[] {
  const metricToTemplates: Record<string, string[]> = {
    'エンゲージメント率': [
      'hook-curiosity-vs-direct',
      'hook-number-vs-story',
      'emoji-heavy-vs-minimal',
    ],
    '保存率': [
      'save-cta-reciprocity-vs-loss',
      'frame-loss-vs-gain',
      'caption-short-vs-long',
    ],
    'シェア率': [
      'social-proof-vs-none',
      'perspective-first-vs-third',
      'format-carousel-vs-reel',
    ],
    'コメント率': [
      'cta-question-vs-command',
      'perspective-first-vs-third',
      'emoji-heavy-vs-minimal',
    ],
    'フォロー転換率': [
      'social-proof-vs-none',
      'hook-curiosity-vs-direct',
      'scarcity-vs-none',
    ],
  };

  const templateIds = metricToTemplates[weakMetric] ?? [
    'hook-curiosity-vs-direct',
    'emoji-heavy-vs-minimal',
    'caption-short-vs-long',
  ];

  return templateIds
    .map((id) => HYPOTHESIS_TEMPLATES.find((t) => t.id === id))
    .filter((t): t is HypothesisTemplate => t !== undefined);
}

// ============================================================
// ユーティリティ
// ============================================================

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
