// ============================================================
// ハッシュタグプール
// ジャンル別3層戦略対応ハッシュタグデータ
// ============================================================

import type { Genre } from '@/lib/types';

/**
 * ハッシュタグエントリ
 * 各タグに推定投稿数とレイヤー情報を保持する
 */
export interface HashtagEntry {
  tag: string;
  layer: 'big' | 'medium' | 'niche';
}

/**
 * ジャンル別ハッシュタグプール
 * big: 100K+投稿（発見用）
 * medium: 10K-100K投稿（競争用）
 * niche: <10K投稿（上位表示用）
 */
export const hashtagPools: Record<Genre, HashtagEntry[]> = {
  fitness: [
    // big（100K+）
    { tag: '#筋トレ', layer: 'big' },
    { tag: '#ダイエット', layer: 'big' },
    { tag: '#フィットネス', layer: 'big' },
    { tag: '#ワークアウト', layer: 'big' },
    { tag: '#トレーニング', layer: 'big' },
    // medium（10K-100K）
    { tag: '#筋トレ初心者', layer: 'medium' },
    { tag: '#宅トレ', layer: 'medium' },
    { tag: '#ボディメイク', layer: 'medium' },
    { tag: '#筋トレ女子', layer: 'medium' },
    { tag: '#ダイエット記録', layer: 'medium' },
    { tag: '#筋肉', layer: 'medium' },
    // niche（<10K）
    { tag: '#筋トレルーティン', layer: 'niche' },
    { tag: '#朝活トレーニング', layer: 'niche' },
    { tag: '#自重トレーニング初心者', layer: 'niche' },
    { tag: '#筋トレモチベーション', layer: 'niche' },
    { tag: '#ホームジム生活', layer: 'niche' },
  ],

  food: [
    { tag: '#おうちごはん', layer: 'big' },
    { tag: '#料理', layer: 'big' },
    { tag: '#レシピ', layer: 'big' },
    { tag: '#グルメ', layer: 'big' },
    { tag: '#手作りごはん', layer: 'big' },
    { tag: '#簡単レシピ', layer: 'medium' },
    { tag: '#時短料理', layer: 'medium' },
    { tag: '#節約レシピ', layer: 'medium' },
    { tag: '#作り置き', layer: 'medium' },
    { tag: '#料理好きな人と繋がりたい', layer: 'medium' },
    { tag: '#ワンパン料理', layer: 'niche' },
    { tag: '#ずぼら飯', layer: 'niche' },
    { tag: '#平日ごはん', layer: 'niche' },
    { tag: '#料理初心者応援', layer: 'niche' },
    { tag: '#献立記録', layer: 'niche' },
  ],

  travel: [
    { tag: '#旅行', layer: 'big' },
    { tag: '#旅行好きな人と繋がりたい', layer: 'big' },
    { tag: '#国内旅行', layer: 'big' },
    { tag: '#旅スタグラム', layer: 'big' },
    { tag: '#絶景', layer: 'big' },
    { tag: '#週末旅行', layer: 'medium' },
    { tag: '#ひとり旅', layer: 'medium' },
    { tag: '#旅行記録', layer: 'medium' },
    { tag: '#カフェ巡り旅', layer: 'medium' },
    { tag: '#温泉旅行', layer: 'medium' },
    { tag: '#穴場スポット', layer: 'niche' },
    { tag: '#弾丸旅行', layer: 'niche' },
    { tag: '#旅のしおり', layer: 'niche' },
    { tag: '#ご当地グルメ旅', layer: 'niche' },
    { tag: '#プチ旅行', layer: 'niche' },
  ],

  beauty: [
    { tag: '#美容', layer: 'big' },
    { tag: '#コスメ', layer: 'big' },
    { tag: '#スキンケア', layer: 'big' },
    { tag: '#メイク', layer: 'big' },
    { tag: '#美肌', layer: 'big' },
    { tag: '#プチプラコスメ', layer: 'medium' },
    { tag: '#スキンケアルーティン', layer: 'medium' },
    { tag: '#ナチュラルメイク', layer: 'medium' },
    { tag: '#美容好きさんと繋がりたい', layer: 'medium' },
    { tag: '#毛穴ケア', layer: 'medium' },
    { tag: '#朝のスキンケア', layer: 'niche' },
    { tag: '#敏感肌スキンケア', layer: 'niche' },
    { tag: '#垢抜けメイク', layer: 'niche' },
    { tag: '#美容オタク', layer: 'niche' },
    { tag: '#コスメレビュー日記', layer: 'niche' },
  ],

  business: [
    { tag: '#副業', layer: 'big' },
    { tag: '#ビジネス', layer: 'big' },
    { tag: '#起業', layer: 'big' },
    { tag: '#マーケティング', layer: 'big' },
    { tag: '#自己投資', layer: 'big' },
    { tag: '#副業初心者', layer: 'medium' },
    { tag: '#フリーランス', layer: 'medium' },
    { tag: '#SNS集客', layer: 'medium' },
    { tag: '#個人ビジネス', layer: 'medium' },
    { tag: '#稼ぐ力', layer: 'medium' },
    { tag: '#副業リアル', layer: 'niche' },
    { tag: '#ひとり起業', layer: 'niche' },
    { tag: '#インスタ運用', layer: 'niche' },
    { tag: '#売上アップ術', layer: 'niche' },
    { tag: '#コンテンツビジネス', layer: 'niche' },
  ],

  lifestyle: [
    { tag: '#暮らし', layer: 'big' },
    { tag: '#丁寧な暮らし', layer: 'big' },
    { tag: '#ライフスタイル', layer: 'big' },
    { tag: '#シンプルライフ', layer: 'big' },
    { tag: '#日常', layer: 'big' },
    { tag: '#暮らしを楽しむ', layer: 'medium' },
    { tag: '#ミニマリスト', layer: 'medium' },
    { tag: '#朝活', layer: 'medium' },
    { tag: '#習慣化', layer: 'medium' },
    { tag: '#整理収納', layer: 'medium' },
    { tag: '#モーニングルーティン', layer: 'niche' },
    { tag: '#暮らしの記録', layer: 'niche' },
    { tag: '#丁寧に暮らす', layer: 'niche' },
    { tag: '#暮らしのアイデア', layer: 'niche' },
    { tag: '#心地よい暮らし', layer: 'niche' },
  ],

  tech: [
    { tag: '#プログラミング', layer: 'big' },
    { tag: '#エンジニア', layer: 'big' },
    { tag: '#IT', layer: 'big' },
    { tag: '#テクノロジー', layer: 'big' },
    { tag: '#ガジェット', layer: 'big' },
    { tag: '#プログラミング初心者', layer: 'medium' },
    { tag: '#Web開発', layer: 'medium' },
    { tag: '#AI活用', layer: 'medium' },
    { tag: '#エンジニアライフ', layer: 'medium' },
    { tag: '#デスク環境', layer: 'medium' },
    { tag: '#駆け出しエンジニア', layer: 'niche' },
    { tag: '#個人開発', layer: 'niche' },
    { tag: '#テック系', layer: 'niche' },
    { tag: '#ガジェットレビュー', layer: 'niche' },
    { tag: '#エンジニア転職', layer: 'niche' },
  ],

  education: [
    { tag: '#勉強', layer: 'big' },
    { tag: '#学び', layer: 'big' },
    { tag: '#資格', layer: 'big' },
    { tag: '#勉強垢', layer: 'big' },
    { tag: '#自己啓発', layer: 'big' },
    { tag: '#勉強法', layer: 'medium' },
    { tag: '#読書記録', layer: 'medium' },
    { tag: '#社会人勉強', layer: 'medium' },
    { tag: '#資格勉強', layer: 'medium' },
    { tag: '#学び直し', layer: 'medium' },
    { tag: '#朝活勉強', layer: 'niche' },
    { tag: '#独学', layer: 'niche' },
    { tag: '#勉強ルーティン', layer: 'niche' },
    { tag: '#大人の学び', layer: 'niche' },
    { tag: '#インプット習慣', layer: 'niche' },
  ],

  fashion: [
    { tag: '#ファッション', layer: 'big' },
    { tag: '#コーデ', layer: 'big' },
    { tag: '#今日のコーデ', layer: 'big' },
    { tag: '#プチプラコーデ', layer: 'big' },
    { tag: '#着回し', layer: 'big' },
    { tag: '#大人カジュアル', layer: 'medium' },
    { tag: '#ユニクロコーデ', layer: 'medium' },
    { tag: '#GUコーデ', layer: 'medium' },
    { tag: '#低身長コーデ', layer: 'medium' },
    { tag: '#骨格診断', layer: 'medium' },
    { tag: '#着回し術', layer: 'niche' },
    { tag: '#ワードローブ計画', layer: 'niche' },
    { tag: '#パーソナルカラー活用', layer: 'niche' },
    { tag: '#服選びのコツ', layer: 'niche' },
    { tag: '#クローゼット整理', layer: 'niche' },
  ],

  photography: [
    { tag: '#写真', layer: 'big' },
    { tag: '#カメラ', layer: 'big' },
    { tag: '#写真好きな人と繋がりたい', layer: 'big' },
    { tag: '#ファインダー越しの私の世界', layer: 'big' },
    { tag: '#風景写真', layer: 'big' },
    { tag: '#カメラ初心者', layer: 'medium' },
    { tag: '#写真撮ってる人と繋がりたい', layer: 'medium' },
    { tag: '#スナップ写真', layer: 'medium' },
    { tag: '#ポートレート', layer: 'medium' },
    { tag: '#写真加工', layer: 'medium' },
    { tag: '#カメラのある生活', layer: 'niche' },
    { tag: '#写真日記', layer: 'niche' },
    { tag: '#撮影テクニック', layer: 'niche' },
    { tag: '#構図の話', layer: 'niche' },
    { tag: '#レタッチ講座', layer: 'niche' },
  ],
};

/**
 * 汎用ハッシュタグ（ジャンル共通で使える）
 */
export const universalHashtags: HashtagEntry[] = [
  { tag: '#有益情報', layer: 'medium' },
  { tag: '#知って得する', layer: 'medium' },
  { tag: '#保存推奨', layer: 'niche' },
  { tag: '#豆知識', layer: 'medium' },
  { tag: '#情報発信', layer: 'medium' },
  { tag: '#為になる', layer: 'niche' },
  { tag: '#まとめ', layer: 'medium' },
  { tag: '#インスタ', layer: 'big' },
];
