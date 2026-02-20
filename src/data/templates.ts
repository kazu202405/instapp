// ============================================================
// テンプレートデータ
// フック、ストーリー、CTAのテンプレート定義
// ============================================================

import type { Genre, HookType, TargetAction, StoryStructure } from '@/lib/types';

// ------------------------------------------------------------
// フックテンプレート
// ------------------------------------------------------------

export interface HookTemplate {
  id: string;
  hookType: HookType;
  template: string;       // {keyword}, {number}, {genre} で置換可能
  genres: Genre[] | 'all'; // 対象ジャンル
  reason: string;          // 行動科学的理由
}

/** フックテンプレート一覧 */
export const hookTemplates: HookTemplate[] = [
  // 好奇心ギャップ型
  {
    id: 'c1',
    hookType: 'curiosity',
    template: '99%の人が知らない{keyword}の裏ワザ',
    genres: 'all',
    reason: '好奇心ギャップ：「自分は1%に入れるか？」という不確実性が読了を促進する',
  },
  {
    id: 'c2',
    hookType: 'curiosity',
    template: '{keyword}を始めて人生が変わった話',
    genres: 'all',
    reason: 'ツァイガルニク効果：結果を先に示唆して「どう変わったか」を知りたくさせる',
  },
  {
    id: 'c3',
    hookType: 'curiosity',
    template: 'プロが絶対に教えない{keyword}のコツ',
    genres: 'all',
    reason: '好奇心ギャップ：「隠された情報」への欲求を刺激する',
  },
  {
    id: 'c4',
    hookType: 'curiosity',
    template: 'まだ{keyword}で消耗してるの？',
    genres: 'all',
    reason: '損失回避：今の自分が損をしているかもしれないという不安を喚起する',
  },
  {
    id: 'c5',
    hookType: 'curiosity',
    template: '{keyword}の正解、実は全然違った',
    genres: 'all',
    reason: '好奇心ギャップ：既知の知識が覆される可能性に引き込まれる',
  },

  // 対立・議論型
  {
    id: 'cv1',
    hookType: 'controversy',
    template: '{keyword}は正直オワコンだと思う',
    genres: 'all',
    reason: 'アイデンティティバイアス：自分の立場を確認したくなりコメントが増える',
  },
  {
    id: 'cv2',
    hookType: 'controversy',
    template: '{keyword}を信じてる人、目を覚まして',
    genres: 'all',
    reason: '社会的証明の逆転：多数派への挑戦がエンゲージメントを生む',
  },
  {
    id: 'cv3',
    hookType: 'controversy',
    template: '本当に{keyword}って必要？正直に話します',
    genres: 'all',
    reason: 'アイデンティティバイアス：賛否が分かれるテーマで議論が活性化する',
  },

  // ストーリー型
  {
    id: 's1',
    hookType: 'story',
    template: '{keyword}に出会って3ヶ月、信じられない変化が起きた',
    genres: 'all',
    reason: 'ストーリーバイアス：時系列の変化ストーリーは記憶に残りやすい',
  },
  {
    id: 's2',
    hookType: 'story',
    template: '正直に言います。{keyword}で大失敗しました',
    genres: 'all',
    reason: '返報性：弱みを見せることで親近感と信頼が生まれる',
  },
  {
    id: 's3',
    hookType: 'story',
    template: '昨日{keyword}していたら、とんでもないことが起きた',
    genres: 'all',
    reason: 'ストーリーバイアス：日常からの予想外の展開に引き込まれる',
  },
  {
    id: 's4',
    hookType: 'story',
    template: '1年前の自分に伝えたい{keyword}の真実',
    genres: 'all',
    reason: 'ストーリーバイアス：過去の自分への手紙形式が共感を生む',
  },

  // 数字型
  {
    id: 'n1',
    hookType: 'number',
    template: 'たった{number}日で{keyword}が劇的に変わる方法',
    genres: 'all',
    reason: 'アンカリング効果：具体的な数字が信頼性と即効性を感じさせる',
  },
  {
    id: 'n2',
    hookType: 'number',
    template: '{keyword}の成功率を{number}%上げる{number}つの習慣',
    genres: 'all',
    reason: 'アンカリング効果+社会的証明：数字の具体性が説得力を高める',
  },
  {
    id: 'n3',
    hookType: 'number',
    template: '{number}万人が実践中！{keyword}の新常識',
    genres: 'all',
    reason: '社会的証明：大きな数字が「みんなやっている」安心感を与える',
  },
  {
    id: 'n4',
    hookType: 'number',
    template: '月{number}万円節約できた{keyword}テクニック',
    genres: ['business', 'lifestyle', 'food'],
    reason: 'アンカリング効果：金額の具体性が価値を実感させる',
  },

  // 質問型
  {
    id: 'q1',
    hookType: 'question',
    template: 'あなたの{keyword}、本当に合ってる？',
    genres: 'all',
    reason: '好奇心ギャップ：自分の知識・判断への不安を喚起する',
  },
  {
    id: 'q2',
    hookType: 'question',
    template: '{keyword}で一番大事なこと、知ってますか？',
    genres: 'all',
    reason: 'アイデンティティバイアス：「知っている側」でありたい欲求を刺激する',
  },
  {
    id: 'q3',
    hookType: 'question',
    template: 'なぜ{keyword}がうまくいかないか、理由わかりますか？',
    genres: 'all',
    reason: '好奇心ギャップ：問題の原因を知りたいという欲求を生む',
  },
  {
    id: 'q4',
    hookType: 'question',
    template: '{keyword}に悩んでいませんか？',
    genres: 'all',
    reason: 'アイデンティティバイアス：共感から始まる信頼構築',
  },

  // ショック型
  {
    id: 'sh1',
    hookType: 'shock',
    template: '【衝撃】{keyword}の真実を暴露します',
    genres: 'all',
    reason: '好奇心ギャップ：「暴露」という強い言葉が情報への渇望を生む',
  },
  {
    id: 'sh2',
    hookType: 'shock',
    template: '{keyword}を続けると取り返しのつかないことになる',
    genres: 'all',
    reason: '損失回避：将来の損失への恐怖が行動を促す',
  },
  {
    id: 'sh3',
    hookType: 'shock',
    template: '今すぐ{keyword}をやめてください。理由を説明します',
    genres: 'all',
    reason: '好奇心ギャップ+損失回避：命令形と理由の欠落が読了を強制する',
  },
  {
    id: 'sh4',
    hookType: 'shock',
    template: '{keyword}業界の闇、全部話します',
    genres: 'all',
    reason: '好奇心ギャップ：隠された情報への欲求を最大化する',
  },
];

// ------------------------------------------------------------
// ストーリー構造テンプレート
// ------------------------------------------------------------

export interface StoryTemplate {
  structure: StoryStructure;
  name: string;             // 構造名
  description: string;      // 説明
  targetActions: TargetAction[]; // 相性の良いアクション
  bodyTemplate: string;     // 本文テンプレート（{theme}, {keyword}で置換）
  valueTemplate: string;    // 価値提供テンプレート
}

/** ストーリー構造テンプレート一覧 */
export const storyTemplates: StoryTemplate[] = [
  {
    structure: 'education',
    name: '教育型',
    description: '知識やノウハウを体系的に伝える構造',
    targetActions: ['save', 'share'],
    bodyTemplate:
      '{keyword}について、多くの人が間違えているポイントがあります。\n\n' +
      'ポイント1: {theme}の基本を理解する\n' +
      '→ まずは土台をしっかり作ることが大切です。\n\n' +
      'ポイント2: 実践で気をつけること\n' +
      '→ 頭でわかっていても行動が伴わないと意味がありません。\n\n' +
      'ポイント3: 継続するためのコツ\n' +
      '→ 小さな成功体験を積み重ねることが鍵です。',
    valueTemplate:
      'この{number}つのポイントを押さえるだけで、{keyword}の成果が大きく変わります。\n' +
      '保存して何度も見返してくださいね。',
  },
  {
    structure: 'narrative',
    name: 'ナラティブ型',
    description: '体験談をベースに共感と学びを届ける構造',
    targetActions: ['comment', 'share'],
    bodyTemplate:
      '実は私も{keyword}で悩んでいた時期がありました。\n\n' +
      '{theme}を始めた頃は失敗の連続で、何度もやめようと思いました。\n\n' +
      'でもある日、気づいたんです。\n' +
      '大切なのは完璧を目指すことじゃなく、小さな一歩を続けることだって。\n\n' +
      'そこから意識を変えたら、少しずつ結果がついてきました。',
    valueTemplate:
      'もし同じように悩んでいる人がいたら、伝えたいことがあります。\n' +
      '今の努力は、必ず未来の自分を助けてくれます。',
  },
  {
    structure: 'empathy',
    name: '共感型',
    description: '読者の悩みに寄り添い、解決策を提示する構造',
    targetActions: ['comment', 'follow'],
    bodyTemplate:
      '{keyword}がうまくいかなくて落ち込んでいませんか？\n\n' +
      '大丈夫です。{theme}で悩むのはあなただけじゃありません。\n\n' +
      '実は多くの人が同じ壁にぶつかっています。\n' +
      'でも、ちょっとした視点の変化で乗り越えられるんです。\n\n' +
      '一番大切なのは、自分を責めないこと。\n' +
      'そして、正しい方法を知ること。',
    valueTemplate:
      '一人で抱え込まないでくださいね。\n' +
      'このアカウントでは{keyword}の悩みを一緒に解決していきます。',
  },
  {
    structure: 'authority',
    name: '権威型',
    description: '専門知識やデータを根拠に信頼を構築する構造',
    targetActions: ['save', 'follow'],
    bodyTemplate:
      '{keyword}について、データに基づいた事実をお伝えします。\n\n' +
      '研究によると、{theme}を正しく実践している人は\n' +
      '成果が出るまでの期間が平均で半分になるそうです。\n\n' +
      'ここで重要なのは「正しく」という部分。\n' +
      '多くの人が見落としがちなポイントがあります。\n\n' +
      'それは、基本に忠実であること。\n' +
      '派手なテクニックより、地道な積み重ねが結果を出します。',
    valueTemplate:
      '科学的に証明された方法で{keyword}を攻略しましょう。\n' +
      'フォローすると最新の知見をお届けします。',
  },
  {
    structure: 'lossAversion',
    name: '損失回避型',
    description: '「やらないリスク」を提示して行動を促す構造',
    targetActions: ['save', 'click'],
    bodyTemplate:
      '{keyword}を放置していると、こんなリスクがあります。\n\n' +
      'リスク1: 時間が経つほど取り返しがつかなくなる\n' +
      'リスク2: 周りはどんどん先に進んでいる\n' +
      'リスク3: {theme}の知識がないまま損し続ける\n\n' +
      'でも安心してください。\n' +
      '今から始めれば、まだ間に合います。',
    valueTemplate:
      '「あの時やっておけば...」と後悔する前に行動しましょう。\n' +
      'この投稿を保存して、今日から{keyword}を始めてください。',
  },
];

// ------------------------------------------------------------
// CTAテンプレート
// ------------------------------------------------------------

export interface CTATemplate {
  id: string;
  targetAction: TargetAction;
  template: string;
  reason: string; // 行動科学的理由
}

/** CTAテンプレート一覧 */
export const ctaTemplates: CTATemplate[] = [
  // 保存促進
  {
    id: 'cta-save-1',
    targetAction: 'save',
    template: '後で見返せるように保存しておいてね',
    reason: '保有効果：一度「自分のもの」にすると手放したくなくなる',
  },
  {
    id: 'cta-save-2',
    targetAction: 'save',
    template: 'この情報、保存しないと絶対損します',
    reason: '損失回避：保存しないことが「損」だと感じさせる',
  },
  {
    id: 'cta-save-3',
    targetAction: 'save',
    template: '永久保存版！いつでも見返せるように保存してね',
    reason: '希少性+保有効果：「永久保存版」が特別な価値を演出する',
  },

  // シェア促進
  {
    id: 'cta-share-1',
    targetAction: 'share',
    template: '同じ悩みを持つ友達にシェアしてあげてね',
    reason: '返報性：有益な情報を共有することで感謝される期待',
  },
  {
    id: 'cta-share-2',
    targetAction: 'share',
    template: 'これ知らない人多いから、ストーリーズでシェアしてほしい',
    reason: '社会的証明：「知っている側」になれることがシェアの動機になる',
  },
  {
    id: 'cta-share-3',
    targetAction: 'share',
    template: '大切な人に教えてあげてください',
    reason: '返報性：利他的な行動を促すことでシェアのハードルを下げる',
  },

  // コメント促進
  {
    id: 'cta-comment-1',
    targetAction: 'comment',
    template: 'あなたはどう思いますか？コメントで教えてね',
    reason: 'アイデンティティバイアス：自分の意見を表明したい欲求を刺激する',
  },
  {
    id: 'cta-comment-2',
    targetAction: 'comment',
    template: '「参考になった」とコメントしてくれたら嬉しいです',
    reason: '返報性：価値提供への感謝をコメントという形で表現させる',
  },
  {
    id: 'cta-comment-3',
    targetAction: 'comment',
    template: '一番響いたポイントをコメントで教えて！',
    reason: 'アイデンティティバイアス：自分の感性を表現する機会を与える',
  },

  // フォロー促進
  {
    id: 'cta-follow-1',
    targetAction: 'follow',
    template: 'フォローすると毎日役立つ情報が届きます',
    reason: '返報性+希少性：フォローの見返りを明示して行動を促す',
  },
  {
    id: 'cta-follow-2',
    targetAction: 'follow',
    template: 'こういう情報をもっと知りたい人はフォローしてね',
    reason: '損失回避：フォローしないと今後の有益情報を逃すと感じさせる',
  },
  {
    id: 'cta-follow-3',
    targetAction: 'follow',
    template: '他の投稿でもっと詳しく解説してます。プロフィールからチェック！',
    reason: 'ツァイガルニク効果：まだ見ていない情報への好奇心を喚起する',
  },

  // クリック促進
  {
    id: 'cta-click-1',
    targetAction: 'click',
    template: '詳しくはプロフィールのリンクから',
    reason: '好奇心ギャップ：詳細情報へのアクセスを促す',
  },
  {
    id: 'cta-click-2',
    targetAction: 'click',
    template: '今だけの特別な情報をリンクにまとめました',
    reason: '希少性：「今だけ」が即座のクリックを促す',
  },
  {
    id: 'cta-click-3',
    targetAction: 'click',
    template: '無料で全部読めます。リンクはプロフィールから',
    reason: '返報性：無料という価値提供がクリックのハードルを下げる',
  },
];

// ------------------------------------------------------------
// 絵文字パターン
// ------------------------------------------------------------

/** セクション区切り用の絵文字パターン */
export const emojiSeparators: string[] = [
  '━━━━━━━━━━━',
  '┈┈┈┈┈┈┈┈┈┈┈',
  '- - - - - - - - - -',
  '▸▸▸▸▸▸▸▸▸▸▸',
];

/** フック用の装飾絵文字 */
export const hookEmojis: Record<HookType, string[]> = {
  curiosity: ['🤫', '👀', '💡', '🔍'],
  controversy: ['🔥', '💬', '⚡', '🤔'],
  story: ['📖', '✨', '💫', '🌟'],
  number: ['📊', '💯', '🎯', '📈'],
  question: ['❓', '🙋', '💭', '🤷'],
  shock: ['😱', '⚠️', '🚨', '💥'],
};

/** CTA用の装飾絵文字 */
export const ctaEmojis: Record<TargetAction, string[]> = {
  save: ['📌', '🔖', '💾', '📥'],
  share: ['📤', '🔗', '💌', '🤝'],
  comment: ['💬', '✍️', '📝', '🗣️'],
  follow: ['👆', '🔔', '➡️', '✅'],
  click: ['👇', '🔗', '📲', '🖱️'],
};
