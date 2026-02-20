// ============================================================
// リール台本テンプレートデータ
// スタイル別のセクション構造、映像指示、BGM提案
// ============================================================

import type { Genre } from '@/lib/types';

/** リールスタイル */
export type ReelStyle = "教育" | "ストーリー" | "ビフォーアフター" | "リスト" | "チュートリアル";

/** 映像指示の種類 */
export type VisualType =
  | "テキストオーバーレイ"
  | "自撮り"
  | "Bロール"
  | "画面録画"
  | "ビフォーアフター分割"
  | "クローズアップ"
  | "タイムラプス"
  | "スライドショー"
  | "POV撮影"
  | "ストップモーション";

// ============================================================
// セクション構造テンプレート
// ============================================================

/** セクション構造テンプレート */
export interface SectionStructure {
  label: string;          // セクションラベル
  durationRatio: number;  // 全体に対する時間の割合（0-1）
  textTemplate: string;   // テキストテンプレート（{theme}, {keyword}で置換）
  visualSuggestions: VisualType[]; // 推奨映像指示
}

/** スタイル別セクション構造 */
export interface StyleTemplate {
  style: ReelStyle;
  description: string;
  hookTemplate: string;
  ctaTemplate: string;
  /** duration別のセクション配列（hookとctaを除く中間セクション） */
  sections: {
    /** 2セクション（15秒用） */
    short: SectionStructure[];
    /** 3セクション（30秒用） */
    medium: SectionStructure[];
    /** 5セクション（60秒用） */
    long: SectionStructure[];
    /** 7セクション（90秒用） */
    extraLong: SectionStructure[];
  };
}

/** スタイル別テンプレート一覧 */
export const styleTemplates: StyleTemplate[] = [
  // 教育型
  {
    style: '教育',
    description: '知識やノウハウを分かりやすく伝える構造',
    hookTemplate: '知らないと損する{theme}の事実',
    ctaTemplate: '他にも{theme}の情報を発信中。フォローして見逃さないでね',
    sections: {
      short: [
        {
          label: 'ポイント解説',
          durationRatio: 0.5,
          textTemplate: '{theme}で一番大事なのは{keyword}です。ここを押さえるだけで結果が変わります。',
          visualSuggestions: ['テキストオーバーレイ', '自撮り'],
        },
        {
          label: 'まとめ',
          durationRatio: 0.5,
          textTemplate: 'つまり{keyword}を意識するだけで{theme}の成果が劇的に変わるということ。',
          visualSuggestions: ['テキストオーバーレイ'],
        },
      ],
      medium: [
        {
          label: '問題提起',
          durationRatio: 0.3,
          textTemplate: '多くの人が{theme}で失敗する理由、知っていますか？',
          visualSuggestions: ['自撮り', 'テキストオーバーレイ'],
        },
        {
          label: '解説',
          durationRatio: 0.4,
          textTemplate: '答えは{keyword}にあります。正しいやり方を説明します。',
          visualSuggestions: ['テキストオーバーレイ', 'Bロール'],
        },
        {
          label: 'まとめ',
          durationRatio: 0.3,
          textTemplate: 'この方法を知っているかどうかで{theme}の結果が変わります。保存して見返してね。',
          visualSuggestions: ['テキストオーバーレイ', '自撮り'],
        },
      ],
      long: [
        {
          label: '問題提起',
          durationRatio: 0.15,
          textTemplate: '{theme}でこんな間違いしていませんか？',
          visualSuggestions: ['自撮り'],
        },
        {
          label: 'よくある誤解',
          durationRatio: 0.2,
          textTemplate: '実は{keyword}について、多くの人が勘違いしています。',
          visualSuggestions: ['テキストオーバーレイ', 'Bロール'],
        },
        {
          label: '正しい方法 前半',
          durationRatio: 0.2,
          textTemplate: '正しいやり方のステップ1は{keyword}を理解すること。',
          visualSuggestions: ['テキストオーバーレイ', '画面録画'],
        },
        {
          label: '正しい方法 後半',
          durationRatio: 0.2,
          textTemplate: 'ステップ2は実際に{keyword}を実践すること。小さく始めるのがコツ。',
          visualSuggestions: ['Bロール', 'クローズアップ'],
        },
        {
          label: 'まとめと実践',
          durationRatio: 0.25,
          textTemplate: 'まとめると、{theme}の鍵は{keyword}。今日から始めてみてください。',
          visualSuggestions: ['自撮り', 'テキストオーバーレイ'],
        },
      ],
      extraLong: [
        {
          label: '問題提起',
          durationRatio: 0.1,
          textTemplate: '{theme}で悩んでいる人が多いですよね。',
          visualSuggestions: ['自撮り'],
        },
        {
          label: 'データ・事実',
          durationRatio: 0.12,
          textTemplate: '実はデータで見ると、{theme}の成功率はとても低いんです。',
          visualSuggestions: ['テキストオーバーレイ'],
        },
        {
          label: 'よくある誤解',
          durationRatio: 0.13,
          textTemplate: 'その原因は{keyword}に対する誤解にあります。',
          visualSuggestions: ['テキストオーバーレイ', 'Bロール'],
        },
        {
          label: '正しい方法1',
          durationRatio: 0.15,
          textTemplate: '正しいアプローチの1つ目。{keyword}の基礎を固めましょう。',
          visualSuggestions: ['画面録画', 'クローズアップ'],
        },
        {
          label: '正しい方法2',
          durationRatio: 0.15,
          textTemplate: '2つ目のポイント。{keyword}を日常に取り入れるコツを紹介します。',
          visualSuggestions: ['Bロール', 'テキストオーバーレイ'],
        },
        {
          label: '応用テクニック',
          durationRatio: 0.15,
          textTemplate: 'さらに上級者向け。{keyword}を応用した効果的な方法があります。',
          visualSuggestions: ['画面録画', 'テキストオーバーレイ'],
        },
        {
          label: 'まとめと次のアクション',
          durationRatio: 0.2,
          textTemplate: '今日紹介した{theme}のポイントをまとめます。まずは{keyword}から始めてみてください。',
          visualSuggestions: ['自撮り', 'テキストオーバーレイ'],
        },
      ],
    },
  },

  // ストーリー型
  {
    style: 'ストーリー',
    description: '体験談やエピソードで引き込む構造',
    hookTemplate: '{theme}で信じられない体験をした話',
    ctaTemplate: 'こういうリアルな体験談をもっと知りたい人はフォローしてね',
    sections: {
      short: [
        {
          label: '背景',
          durationRatio: 0.5,
          textTemplate: 'ある日、{theme}に挑戦することにしました。最初は不安だったけど...',
          visualSuggestions: ['自撮り', 'POV撮影'],
        },
        {
          label: '結果と学び',
          durationRatio: 0.5,
          textTemplate: '結果、{keyword}の大切さに気づいた。この経験が今の自分を作ってくれました。',
          visualSuggestions: ['自撮り', 'Bロール'],
        },
      ],
      medium: [
        {
          label: 'きっかけ',
          durationRatio: 0.3,
          textTemplate: '{theme}を始めたきっかけは、ある{keyword}との出会いでした。',
          visualSuggestions: ['自撮り', 'Bロール'],
        },
        {
          label: '困難',
          durationRatio: 0.35,
          textTemplate: '最初はうまくいかなくて。{keyword}で何度も失敗しました。もう辞めようと思った。',
          visualSuggestions: ['POV撮影', '自撮り'],
        },
        {
          label: '転機と成長',
          durationRatio: 0.35,
          textTemplate: 'でも諦めなかった。そしたら{theme}が楽しくなってきたんです。',
          visualSuggestions: ['Bロール', '自撮り'],
        },
      ],
      long: [
        {
          label: 'きっかけ',
          durationRatio: 0.15,
          textTemplate: '{theme}との出会いは突然でした。',
          visualSuggestions: ['自撮り'],
        },
        {
          label: '初期の苦労',
          durationRatio: 0.2,
          textTemplate: '始めた頃は{keyword}が全然わからなくて、毎日が手探り状態。',
          visualSuggestions: ['POV撮影', 'Bロール'],
        },
        {
          label: '転機',
          durationRatio: 0.2,
          textTemplate: 'ある日、{keyword}についてある気づきがあったんです。',
          visualSuggestions: ['自撮り', 'クローズアップ'],
        },
        {
          label: '変化',
          durationRatio: 0.2,
          textTemplate: 'そこから{theme}への向き合い方が変わって、結果も変わり始めた。',
          visualSuggestions: ['Bロール', 'タイムラプス'],
        },
        {
          label: '今の自分',
          durationRatio: 0.25,
          textTemplate: '今では{theme}が生活の一部。あの時の自分に「大丈夫だよ」って言いたい。',
          visualSuggestions: ['自撮り', 'Bロール'],
        },
      ],
      extraLong: [
        {
          label: '導入',
          durationRatio: 0.08,
          textTemplate: '今日は{theme}について、私の経験を話します。',
          visualSuggestions: ['自撮り'],
        },
        {
          label: '背景',
          durationRatio: 0.12,
          textTemplate: '{theme}を始める前の私は、{keyword}について何も知りませんでした。',
          visualSuggestions: ['Bロール'],
        },
        {
          label: '挑戦',
          durationRatio: 0.13,
          textTemplate: 'でも「やってみよう」と思って、{keyword}に挑戦した。',
          visualSuggestions: ['POV撮影', '自撮り'],
        },
        {
          label: '失敗',
          durationRatio: 0.15,
          textTemplate: '案の定、最初は失敗の連続。{keyword}が全然うまくいかなかった。',
          visualSuggestions: ['自撮り', 'Bロール'],
        },
        {
          label: '学び',
          durationRatio: 0.15,
          textTemplate: 'でもその失敗から大切なことを学んだ。{keyword}の本質に気づいたんです。',
          visualSuggestions: ['テキストオーバーレイ', '自撮り'],
        },
        {
          label: '成長',
          durationRatio: 0.17,
          textTemplate: 'そこからは{theme}がどんどん楽しくなって、結果もついてきた。',
          visualSuggestions: ['タイムラプス', 'Bロール'],
        },
        {
          label: 'メッセージ',
          durationRatio: 0.2,
          textTemplate: '伝えたいのは「始めるのに遅すぎることはない」ということ。{theme}は誰でもできる。',
          visualSuggestions: ['自撮り'],
        },
      ],
    },
  },

  // ビフォーアフター型
  {
    style: 'ビフォーアフター',
    description: '変化の過程を見せて視聴者の期待を高める構造',
    hookTemplate: '{theme}を始める前と後で、こんなに変わった',
    ctaTemplate: 'あなたも変化を始めよう。まずはフォローから',
    sections: {
      short: [
        {
          label: 'ビフォー',
          durationRatio: 0.5,
          textTemplate: 'Before: {keyword}を始める前はこんな状態でした。',
          visualSuggestions: ['ビフォーアフター分割', 'Bロール'],
        },
        {
          label: 'アフター',
          durationRatio: 0.5,
          textTemplate: 'After: {keyword}を続けた結果、こうなりました。',
          visualSuggestions: ['ビフォーアフター分割', 'クローズアップ'],
        },
      ],
      medium: [
        {
          label: 'ビフォー',
          durationRatio: 0.3,
          textTemplate: 'Before: {theme}を始める前のリアルな姿。{keyword}も全然ダメだった。',
          visualSuggestions: ['ビフォーアフター分割'],
        },
        {
          label: 'プロセス',
          durationRatio: 0.35,
          textTemplate: '何をしたか: 毎日{keyword}を続けた。最初は辛かったけど、だんだん楽しくなってきた。',
          visualSuggestions: ['タイムラプス', 'Bロール'],
        },
        {
          label: 'アフター',
          durationRatio: 0.35,
          textTemplate: 'After: 今はこんなに変わりました。{theme}の力ってすごい。',
          visualSuggestions: ['ビフォーアフター分割', 'クローズアップ'],
        },
      ],
      long: [
        {
          label: 'ビフォーの状態',
          durationRatio: 0.15,
          textTemplate: '以前の状態をお見せします。{theme}を始める前のリアル。',
          visualSuggestions: ['ビフォーアフター分割'],
        },
        {
          label: '変化のきっかけ',
          durationRatio: 0.15,
          textTemplate: 'このままじゃダメだと思って、{keyword}を始めることにしました。',
          visualSuggestions: ['自撮り'],
        },
        {
          label: '1ヶ月目',
          durationRatio: 0.2,
          textTemplate: '1ヶ月目: まだ目に見える変化はないけど、{keyword}が習慣になってきた。',
          visualSuggestions: ['タイムラプス', 'Bロール'],
        },
        {
          label: '3ヶ月目',
          durationRatio: 0.2,
          textTemplate: '3ヶ月目: 周りから「変わったね」って言われるようになった。',
          visualSuggestions: ['ビフォーアフター分割', 'クローズアップ'],
        },
        {
          label: '現在のアフター',
          durationRatio: 0.3,
          textTemplate: '今の状態がこちら。{theme}を続けてよかった。みんなにも変化を実感してほしい。',
          visualSuggestions: ['ビフォーアフター分割', '自撮り'],
        },
      ],
      extraLong: [
        {
          label: 'イントロ',
          durationRatio: 0.08,
          textTemplate: '私の{theme}のビフォーアフター、全部見せます。',
          visualSuggestions: ['自撮り'],
        },
        {
          label: 'ビフォーの状態',
          durationRatio: 0.12,
          textTemplate: 'これがスタート時点。正直、ここから変われると思ってなかった。',
          visualSuggestions: ['ビフォーアフター分割'],
        },
        {
          label: 'きっかけ',
          durationRatio: 0.1,
          textTemplate: 'でも{keyword}と出会って、変わる決意をした。',
          visualSuggestions: ['自撮り', 'テキストオーバーレイ'],
        },
        {
          label: '1ヶ月目',
          durationRatio: 0.13,
          textTemplate: '1ヶ月目の変化。まだ小さいけど、確かに変わり始めている。',
          visualSuggestions: ['タイムラプス'],
        },
        {
          label: '2ヶ月目',
          durationRatio: 0.13,
          textTemplate: '2ヶ月目。{keyword}のコツがわかってきて、加速し始めた。',
          visualSuggestions: ['Bロール', 'クローズアップ'],
        },
        {
          label: '3ヶ月目',
          durationRatio: 0.14,
          textTemplate: '3ヶ月目。もう別人。自分でもびっくりするくらい変わった。',
          visualSuggestions: ['ビフォーアフター分割'],
        },
        {
          label: '感想とアフター',
          durationRatio: 0.3,
          textTemplate: '最終的なアフター。{theme}は人生を変える力がある。あなたも始めてみませんか？',
          visualSuggestions: ['ビフォーアフター分割', '自撮り'],
        },
      ],
    },
  },

  // リスト型
  {
    style: 'リスト',
    description: '番号付きリストでテンポよく情報を伝える構造',
    hookTemplate: '{theme}で絶対やるべきこと、全部教えます',
    ctaTemplate: '全部覚えられた？保存して見返してね',
    sections: {
      short: [
        {
          label: 'リスト前半',
          durationRatio: 0.5,
          textTemplate: '1つ目: {keyword}を毎日やること。2つ目: 記録をつけること。',
          visualSuggestions: ['テキストオーバーレイ', 'スライドショー'],
        },
        {
          label: 'リスト後半',
          durationRatio: 0.5,
          textTemplate: '3つ目: 仲間を見つけること。これだけで{theme}は変わります。',
          visualSuggestions: ['テキストオーバーレイ', 'スライドショー'],
        },
      ],
      medium: [
        {
          label: 'リスト1-2',
          durationRatio: 0.3,
          textTemplate: '1つ目: {keyword}の基礎を固める。2つ目: 毎日少しでも続ける。',
          visualSuggestions: ['テキストオーバーレイ', 'スライドショー'],
        },
        {
          label: 'リスト3-4',
          durationRatio: 0.35,
          textTemplate: '3つ目: 失敗を恐れない。4つ目: フィードバックを受け入れる。',
          visualSuggestions: ['テキストオーバーレイ', 'Bロール'],
        },
        {
          label: 'リスト5 + まとめ',
          durationRatio: 0.35,
          textTemplate: '5つ目: {keyword}を楽しむこと。{theme}は楽しんだ人が一番成長する。',
          visualSuggestions: ['テキストオーバーレイ', '自撮り'],
        },
      ],
      long: [
        {
          label: 'リスト1',
          durationRatio: 0.15,
          textTemplate: '1つ目: {keyword}の基本を理解しよう。ここが全ての土台になります。',
          visualSuggestions: ['テキストオーバーレイ'],
        },
        {
          label: 'リスト2-3',
          durationRatio: 0.2,
          textTemplate: '2つ目: 実践あるのみ。3つ目: {keyword}の記録をつける。データが味方になる。',
          visualSuggestions: ['スライドショー', 'Bロール'],
        },
        {
          label: 'リスト4-5',
          durationRatio: 0.2,
          textTemplate: '4つ目: 仲間を見つける。5つ目: 定期的に振り返る。',
          visualSuggestions: ['テキストオーバーレイ', 'Bロール'],
        },
        {
          label: 'リスト6-7',
          durationRatio: 0.2,
          textTemplate: '6つ目: {keyword}に投資する。7つ目: 完璧を目指さない。',
          visualSuggestions: ['テキストオーバーレイ', 'スライドショー'],
        },
        {
          label: 'まとめ',
          durationRatio: 0.25,
          textTemplate: '以上7つのポイント。{theme}を成功させる秘訣は全部この中にあります。',
          visualSuggestions: ['自撮り', 'テキストオーバーレイ'],
        },
      ],
      extraLong: [
        {
          label: '導入',
          durationRatio: 0.08,
          textTemplate: '今から{theme}のポイントを全部紹介します。最後まで見てね。',
          visualSuggestions: ['自撮り'],
        },
        {
          label: 'リスト1-2',
          durationRatio: 0.13,
          textTemplate: '1. {keyword}の基礎知識を身につける。2. 小さく始める。',
          visualSuggestions: ['テキストオーバーレイ', 'スライドショー'],
        },
        {
          label: 'リスト3-4',
          durationRatio: 0.13,
          textTemplate: '3. 毎日の習慣にする。4. {keyword}の記録を可視化する。',
          visualSuggestions: ['テキストオーバーレイ', 'スライドショー'],
        },
        {
          label: 'リスト5-6',
          durationRatio: 0.13,
          textTemplate: '5. フィードバックを活かす。6. 仲間と高め合う。',
          visualSuggestions: ['テキストオーバーレイ', 'Bロール'],
        },
        {
          label: 'リスト7-8',
          durationRatio: 0.13,
          textTemplate: '7. 定期的に目標を見直す。8. {keyword}に時間を投資する。',
          visualSuggestions: ['テキストオーバーレイ', 'スライドショー'],
        },
        {
          label: 'リスト9-10',
          durationRatio: 0.15,
          textTemplate: '9. 完璧主義を捨てる。10. 何より{theme}を楽しむこと。',
          visualSuggestions: ['テキストオーバーレイ', '自撮り'],
        },
        {
          label: 'まとめ',
          durationRatio: 0.25,
          textTemplate: '以上10個のポイント。全部やる必要はない。1つでも始めてみてね。',
          visualSuggestions: ['自撮り', 'テキストオーバーレイ'],
        },
      ],
    },
  },

  // チュートリアル型
  {
    style: 'チュートリアル',
    description: '手順を追って実践方法を教える構造',
    hookTemplate: '{theme}のやり方、ゼロから教えます',
    ctaTemplate: 'やってみた人はコメントで結果を教えてね。他のチュートリアルはフォローでチェック',
    sections: {
      short: [
        {
          label: '準備',
          durationRatio: 0.4,
          textTemplate: 'まず{keyword}を用意します。準備はこれだけでOK。',
          visualSuggestions: ['クローズアップ', '画面録画'],
        },
        {
          label: '実践',
          durationRatio: 0.6,
          textTemplate: 'あとは{keyword}をこうするだけ。簡単でしょ？',
          visualSuggestions: ['画面録画', 'POV撮影'],
        },
      ],
      medium: [
        {
          label: '準備',
          durationRatio: 0.25,
          textTemplate: 'まず必要なものを準備。{keyword}があればOKです。',
          visualSuggestions: ['クローズアップ', 'Bロール'],
        },
        {
          label: 'ステップ1',
          durationRatio: 0.35,
          textTemplate: 'Step 1: {keyword}をセットアップします。ポイントは丁寧にやること。',
          visualSuggestions: ['画面録画', 'POV撮影'],
        },
        {
          label: 'ステップ2 + 完成',
          durationRatio: 0.4,
          textTemplate: 'Step 2: 仕上げに{keyword}を調整して...完成！',
          visualSuggestions: ['画面録画', 'クローズアップ'],
        },
      ],
      long: [
        {
          label: '完成イメージ',
          durationRatio: 0.12,
          textTemplate: '今日のゴールはこれ。{theme}を完成させます。',
          visualSuggestions: ['クローズアップ'],
        },
        {
          label: '準備',
          durationRatio: 0.15,
          textTemplate: '必要なもの: {keyword}。準備完了したら始めましょう。',
          visualSuggestions: ['Bロール', 'クローズアップ'],
        },
        {
          label: 'ステップ1',
          durationRatio: 0.2,
          textTemplate: 'Step 1: {keyword}の下準備。ここが一番大事なポイント。',
          visualSuggestions: ['画面録画', 'POV撮影'],
        },
        {
          label: 'ステップ2',
          durationRatio: 0.2,
          textTemplate: 'Step 2: メインの作業。{keyword}をこのように進めていきます。',
          visualSuggestions: ['画面録画', 'クローズアップ'],
        },
        {
          label: '仕上げ + 完成',
          durationRatio: 0.33,
          textTemplate: 'Step 3: 最後の仕上げ。{keyword}を調整して...完成！どうですか？',
          visualSuggestions: ['クローズアップ', 'ビフォーアフター分割'],
        },
      ],
      extraLong: [
        {
          label: '完成イメージ',
          durationRatio: 0.08,
          textTemplate: '今日作るのはこれ。{theme}を一から作ります。',
          visualSuggestions: ['クローズアップ'],
        },
        {
          label: '材料・準備',
          durationRatio: 0.1,
          textTemplate: '必要なものはこちら。{keyword}を中心に揃えてください。',
          visualSuggestions: ['Bロール', 'クローズアップ'],
        },
        {
          label: 'ステップ1',
          durationRatio: 0.13,
          textTemplate: 'Step 1: {keyword}の下準備から。丁寧にやると仕上がりが違います。',
          visualSuggestions: ['画面録画', 'POV撮影'],
        },
        {
          label: 'ステップ2',
          durationRatio: 0.14,
          textTemplate: 'Step 2: 次に{keyword}を組み立てていきます。',
          visualSuggestions: ['画面録画', 'クローズアップ'],
        },
        {
          label: 'ステップ3',
          durationRatio: 0.14,
          textTemplate: 'Step 3: ここがポイント。{keyword}の角度に注意してください。',
          visualSuggestions: ['クローズアップ', 'POV撮影'],
        },
        {
          label: '仕上げ',
          durationRatio: 0.15,
          textTemplate: 'Step 4: 最後の仕上げ。細部にこだわると全体のクオリティが上がります。',
          visualSuggestions: ['クローズアップ', '画面録画'],
        },
        {
          label: '完成 + コツまとめ',
          durationRatio: 0.26,
          textTemplate: '完成！コツは{keyword}を丁寧にやること。初めてでもできるので挑戦してみてね。',
          visualSuggestions: ['ビフォーアフター分割', '自撮り'],
        },
      ],
    },
  },
];

// ============================================================
// ジャンル別映像指示パターン
// ============================================================

/** ジャンル別の推奨映像スタイル */
export const genreVisualPatterns: Record<Genre, {
  primaryVisuals: VisualType[];
  tips: string;
}> = {
  fitness: {
    primaryVisuals: ['自撮り', 'POV撮影', 'タイムラプス', 'ビフォーアフター分割'],
    tips: 'トレーニング中の動きをダイナミックに撮影。ビフォーアフターは効果大。',
  },
  food: {
    primaryVisuals: ['クローズアップ', 'POV撮影', 'タイムラプス', 'ストップモーション'],
    tips: '調理工程のタイムラプスと完成品のクローズアップが鉄板。湯気や音も重要。',
  },
  travel: {
    primaryVisuals: ['Bロール', 'POV撮影', 'タイムラプス', 'スライドショー'],
    tips: '絶景のBロールと移動中のPOVが効果的。ドローン映像があると最高。',
  },
  beauty: {
    primaryVisuals: ['クローズアップ', '自撮り', 'ビフォーアフター分割', 'POV撮影'],
    tips: 'メイクプロセスのクローズアップとビフォーアフターが必須。照明が命。',
  },
  business: {
    primaryVisuals: ['テキストオーバーレイ', '自撮り', '画面録画', 'スライドショー'],
    tips: 'テキストオーバーレイで要点を強調。自撮り解説は信頼感を与える。',
  },
  lifestyle: {
    primaryVisuals: ['Bロール', 'POV撮影', 'タイムラプス', '自撮り'],
    tips: '日常の美しい瞬間をBロールで。朝のルーティンはタイムラプスが映える。',
  },
  tech: {
    primaryVisuals: ['画面録画', 'クローズアップ', 'テキストオーバーレイ', '自撮り'],
    tips: '画面録画でツールや手順を見せる。テキストオーバーレイで要点を補足。',
  },
  education: {
    primaryVisuals: ['テキストオーバーレイ', '自撮り', 'スライドショー', '画面録画'],
    tips: 'テキストオーバーレイで学習ポイントを可視化。スライド形式も効果的。',
  },
  fashion: {
    primaryVisuals: ['自撮り', 'Bロール', 'ビフォーアフター分割', 'スライドショー'],
    tips: 'コーデ全身ショットと着替えトランジションが定番。鏡越しの自撮りも人気。',
  },
  photography: {
    primaryVisuals: ['Bロール', 'クローズアップ', '画面録画', 'ビフォーアフター分割'],
    tips: '撮影風景のBロールとレタッチのビフォーアフターが効果的。',
  },
};

// ============================================================
// BGM提案マッピング
// ============================================================

/** BGM提案データ */
export interface MusicSuggestion {
  mood: string;
  description: string;
}

/** ジャンル x スタイル別のBGM提案 */
export const musicSuggestions: Record<Genre, Record<ReelStyle, MusicSuggestion>> = {
  fitness: {
    '教育': { mood: 'アップビート', description: 'テンポの速いEDMやヒップホップ系。やる気を出させるBGM。' },
    'ストーリー': { mood: 'モチベーショナル', description: '徐々に盛り上がるインスピレーション系BGM。' },
    'ビフォーアフター': { mood: 'ドラマチック', description: '静かな導入から力強いドロップへ。変化を演出するBGM。' },
    'リスト': { mood: 'リズミカル', description: 'テンポよく切り替わるポップ系BGM。' },
    'チュートリアル': { mood: 'エネルギッシュ', description: '軽快でテンポの良いワークアウト向けBGM。' },
  },
  food: {
    '教育': { mood: 'カジュアル', description: 'ウクレレやアコースティック系の温かいBGM。' },
    'ストーリー': { mood: 'ノスタルジック', description: 'ピアノやオルゴール系の温かみのあるBGM。' },
    'ビフォーアフター': { mood: 'ワクワク感', description: 'マリンバやクラップ系の楽しいBGM。' },
    'リスト': { mood: '軽快', description: 'テンポの良いジャズやボサノバ風BGM。' },
    'チュートリアル': { mood: 'リラックス', description: 'Lo-Fiやチル系の落ち着いたBGM。' },
  },
  travel: {
    '教育': { mood: 'アドベンチャー', description: 'シネマティックで壮大なオーケストラ系BGM。' },
    'ストーリー': { mood: 'エモーショナル', description: 'ピアノとストリングスの感動系BGM。' },
    'ビフォーアフター': { mood: 'シネマティック', description: '映画のようなスケール感のあるBGM。' },
    'リスト': { mood: 'ポップ', description: '明るくキャッチーなインディーポップ系BGM。' },
    'チュートリアル': { mood: 'カジュアル', description: 'アコースティックギターの爽やかなBGM。' },
  },
  beauty: {
    '教育': { mood: 'エレガント', description: 'ピアノやハープ系の上品なBGM。' },
    'ストーリー': { mood: '感動的', description: 'ストリングスの感動系BGM。' },
    'ビフォーアフター': { mood: 'ドラマチック', description: '静かな導入からキラキラしたドロップへ。' },
    'リスト': { mood: 'キュート', description: 'ポップで可愛らしいBGM。' },
    'チュートリアル': { mood: 'おしゃれ', description: 'Lo-Fi系やチルポップ。トレンド感のあるBGM。' },
  },
  business: {
    '教育': { mood: 'プロフェッショナル', description: 'クリーンなコーポレート系BGM。' },
    'ストーリー': { mood: 'インスピレーション', description: '徐々に盛り上がるモチベーション系BGM。' },
    'ビフォーアフター': { mood: 'アップリフティング', description: '希望を感じさせる明るいBGM。' },
    'リスト': { mood: 'テンポ良い', description: 'テクノやエレクトロ系のクリーンなBGM。' },
    'チュートリアル': { mood: 'クリーン', description: '邪魔にならないアンビエント系BGM。' },
  },
  lifestyle: {
    '教育': { mood: 'ナチュラル', description: 'アコースティック系の自然体なBGM。' },
    'ストーリー': { mood: 'エモーショナル', description: 'ピアノとギターの温かいBGM。' },
    'ビフォーアフター': { mood: '爽やか', description: '明るく前向きなインディーポップ系BGM。' },
    'リスト': { mood: 'カジュアル', description: 'ウクレレやクラップ系の楽しいBGM。' },
    'チュートリアル': { mood: 'リラックス', description: 'Lo-Fiやアンビエント系の落ち着いたBGM。' },
  },
  tech: {
    '教育': { mood: 'フューチャリスティック', description: 'エレクトロニカやシンセ系のモダンなBGM。' },
    'ストーリー': { mood: 'シネマティック', description: 'テクノロジー感のあるアンビエント系BGM。' },
    'ビフォーアフター': { mood: 'プログレッシブ', description: '徐々にビルドアップするEDM系BGM。' },
    'リスト': { mood: 'リズミカル', description: 'テンポの良いテクノポップ系BGM。' },
    'チュートリアル': { mood: 'ミニマル', description: 'Lo-Fi系の集中できるBGM。' },
  },
  education: {
    '教育': { mood: 'インテリジェント', description: 'ピアノやマリンバの知的な雰囲気のBGM。' },
    'ストーリー': { mood: '温かい', description: 'アコースティック系の優しいBGM。' },
    'ビフォーアフター': { mood: '達成感', description: '明るく前向きなアップリフティングBGM。' },
    'リスト': { mood: 'テンポ良い', description: 'クラップやスナップ系のリズミカルなBGM。' },
    'チュートリアル': { mood: '集中', description: 'アンビエントやLo-Fi系の邪魔にならないBGM。' },
  },
  fashion: {
    '教育': { mood: 'スタイリッシュ', description: 'トレンド感のあるR&Bやネオソウル系BGM。' },
    'ストーリー': { mood: 'ドラマチック', description: 'ファッションショー風のスタイリッシュなBGM。' },
    'ビフォーアフター': { mood: 'グラマラス', description: '華やかで目を引くポップ系BGM。' },
    'リスト': { mood: 'トレンディ', description: '今っぽいインディーポップやR&B系BGM。' },
    'チュートリアル': { mood: 'カジュアルポップ', description: '軽快でおしゃれなポップ系BGM。' },
  },
  photography: {
    '教育': { mood: 'アーティスティック', description: 'ピアノやアンビエント系の芸術的なBGM。' },
    'ストーリー': { mood: 'シネマティック', description: 'オーケストラの感動的なBGM。' },
    'ビフォーアフター': { mood: 'マジカル', description: 'キラキラしたシンセ系のBGM。レタッチの魔法を演出。' },
    'リスト': { mood: 'リラックス', description: 'ジャズやボサノバ系のおしゃれなBGM。' },
    'チュートリアル': { mood: '集中', description: 'Lo-Fiやアンビエント系の落ち着いたBGM。' },
  },
};
