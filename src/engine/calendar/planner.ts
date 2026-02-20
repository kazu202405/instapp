// ============================================================
// コンテンツカレンダー生成エンジン
// ピラー配分: 教育40% / インスピレーション30% / コネクション30%
// 最適投稿時間: 平日朝7-9時 / 昼12-13時 / 夜19-21時（JST）
// ============================================================

import type {
  CalendarEntry,
  ContentPillar,
  PostFormat,
  Genre,
  HookType,
} from '@/lib/types';
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns';

// ============================================================
// 定数定義
// ============================================================

/** デフォルト週間投稿数 */
const DEFAULT_POSTS_PER_WEEK = 5;

/** ピラー配分比率（合計100%） */
const PILLAR_DISTRIBUTION: { pillar: ContentPillar; weight: number }[] = [
  { pillar: 'education', weight: 0.40 },
  { pillar: 'inspiration', weight: 0.30 },
  { pillar: 'connection', weight: 0.30 },
];

/**
 * 曜日別最適投稿時間（JST）
 * 0=日, 1=月, 2=火, 3=水, 4=木, 5=金, 6=土
 */
const OPTIMAL_TIMES: Record<number, string[]> = {
  0: ['10:00', '18:00', '20:00'],  // 日曜: ゆっくり朝〜夜
  1: ['07:30', '12:00', '19:00'],  // 月曜: 通勤・昼・帰宅
  2: ['07:30', '12:00', '20:00'],  // 火曜: 通勤・昼・夜
  3: ['07:00', '12:00', '19:30'],  // 水曜: 通勤・昼・夜
  4: ['07:30', '12:30', '20:00'],  // 木曜: 通勤・昼・夜
  5: ['07:00', '12:00', '21:00'],  // 金曜: 通勤・昼・夜遅め
  6: ['09:00', '14:00', '20:00'],  // 土曜: 朝遅め・午後・夜
};

/**
 * フォーマット別の最適時間帯インデックス
 * リール: 夜（SNS利用ピーク）
 * カルーセル: 朝（じっくり読む時間）
 * 画像: 昼（軽く見る時間）
 * ストーリー: 夜（チェック時間）
 */
const FORMAT_TIME_PREFERENCE: Record<PostFormat, number> = {
  reel: 2,      // 夜の時間帯
  carousel: 0,  // 朝の時間帯
  image: 1,     // 昼の時間帯
  story: 2,     // 夜の時間帯
};

// ============================================================
// ジャンル別テーマ提案
// ============================================================

/** ジャンル×ピラー別のテーマ候補 */
const THEME_POOL: Record<Genre, Record<ContentPillar, string[]>> = {
  fitness: {
    education: [
      '初心者向け自重トレーニング3選',
      '筋トレ前後の食事で意識すべきこと',
      'ストレッチの正しいやり方',
      'プロテインの選び方完全ガイド',
      '有酸素運動と筋トレの順番',
    ],
    inspiration: [
      '3ヶ月のビフォーアフター記録',
      'トレーニングを続けて変わったこと',
      '今日のワークアウトルーティン',
      '朝活トレーニングのすすめ',
      'モチベーションが下がった時の対処法',
    ],
    connection: [
      'みんなの筋トレあるある',
      'トレーニング仲間募集',
      'お気に入りのジムウェア紹介',
      '失敗談から学んだこと',
      '休息日の過ごし方を教えて',
    ],
  },
  food: {
    education: [
      '時短で作れる平日ランチレシピ',
      '調味料の使い方基本テクニック',
      '食材の保存方法まとめ',
      '栄養バランスの整え方',
      '包丁の基本的な使い方',
    ],
    inspiration: [
      '今日のお弁当記録',
      '週末のおうちカフェメニュー',
      'お気に入りのキッチングッズ',
      '季節の食材を使った一品',
      '家族が喜んだレシピベスト3',
    ],
    connection: [
      'みんなの夕飯何にした？',
      '料理初心者だった頃の失敗談',
      'おすすめ調味料を教えて',
      '地元のおすすめグルメ',
      '料理のモチベーション維持法',
    ],
  },
  travel: {
    education: [
      '旅行の持ち物チェックリスト',
      'ホテル予約で得するコツ',
      '写真映えスポットの見つけ方',
      '旅先での節約テクニック',
      '一人旅を安全に楽しむ方法',
    ],
    inspiration: [
      '最近行った絶景スポット',
      '旅先で出会った感動の瞬間',
      'お気に入りの旅の写真',
      '人生で一度は行きたい場所',
      '季節限定の絶景紹介',
    ],
    connection: [
      'おすすめの旅先を教えて',
      '旅行中のハプニング体験談',
      '一人旅派？グループ旅派？',
      '旅の計画の立て方を共有',
      'ご当地グルメのおすすめ',
    ],
  },
  beauty: {
    education: [
      '朝のスキンケアルーティン',
      'プチプラで揃えるメイク道具',
      '肌タイプ別おすすめケア',
      '日焼け止めの正しい塗り方',
      'メイク崩れを防ぐコツ',
    ],
    inspiration: [
      '今日のメイクプロセス',
      'お気に入りコスメベスト5',
      'スキンケアで肌が変わった話',
      '季節のおすすめコスメ',
      'ナチュラルメイクのポイント',
    ],
    connection: [
      'みんなのスキンケア事情',
      '買ってよかったコスメ教えて',
      '美容の悩み共有しよう',
      'メイクの失敗談',
      'おすすめの美容法を教えて',
    ],
  },
  business: {
    education: [
      'SNS集客の基本ステップ',
      '副業を始める前に知るべきこと',
      '時間管理のフレームワーク',
      'マーケティングの基礎知識',
      '売上を伸ばすための分析方法',
    ],
    inspiration: [
      '独立して1年で学んだこと',
      '売上が伸びた瞬間の話',
      '毎日のルーティン公開',
      '仕事環境のこだわり',
      '目標設定の方法と達成のコツ',
    ],
    connection: [
      '同業者の悩みを聞かせて',
      'おすすめビジネス本',
      'フリーランスあるある',
      '仕事のモチベーション維持法',
      '最近チャレンジしたこと',
    ],
  },
  lifestyle: {
    education: [
      '朝活を習慣にする方法',
      '部屋を整える収納テクニック',
      '心地よい暮らしの作り方',
      'ミニマリスト入門ガイド',
      '睡眠の質を上げるコツ',
    ],
    inspiration: [
      '今日のモーニングルーティン',
      'お気に入りの暮らしの道具',
      '季節を感じる過ごし方',
      'リラックスタイムの紹介',
      '暮らしを変えた小さな習慣',
    ],
    connection: [
      'みんなの朝のルーティン',
      'おすすめの暮らしアイテム',
      '生活で工夫していること',
      '理想の暮らしについて語ろう',
      '最近始めた新しい習慣',
    ],
  },
  tech: {
    education: [
      'プログラミング初心者の学習ロードマップ',
      '開発効率を上げるツール紹介',
      '最新テクノロジートレンド解説',
      'セキュリティの基本知識',
      'AI活用の実践テクニック',
    ],
    inspiration: [
      '個人開発プロジェクト紹介',
      'デスク環境ツアー',
      'エンジニアとしての成長記録',
      '技術書のおすすめ',
      'コーディングのこだわりポイント',
    ],
    connection: [
      'みんなの開発環境を見せて',
      'プログラミング学習の壁と突破法',
      'おすすめの技術系コミュニティ',
      'エンジニアあるある',
      '使っているガジェット紹介',
    ],
  },
  education: {
    education: [
      '効率的な勉強法5選',
      '記憶に残るノートの取り方',
      '資格勉強のスケジュール管理',
      '集中力を高める環境作り',
      'インプットとアウトプットの黄金比',
    ],
    inspiration: [
      '勉強を続けて変わったこと',
      '今日の学習記録',
      '合格体験記',
      '読書記録と気づき',
      '学び直しで得たもの',
    ],
    connection: [
      '勉強仲間募集',
      'おすすめの参考書を教えて',
      '勉強のモチベーション維持法',
      'みんなの勉強スペース',
      '学習中の悩みを共有',
    ],
  },
  fashion: {
    education: [
      '骨格診断別おすすめコーデ',
      'プチプラで作る着回しコーデ',
      '服の選び方の基本ルール',
      'パーソナルカラー活用術',
      'クローゼット整理のコツ',
    ],
    inspiration: [
      '今日のコーディネート',
      '最近買ってよかったアイテム',
      '季節の着回しコーデ',
      'お気に入りブランド紹介',
      'ワードローブ計画公開',
    ],
    connection: [
      'みんなの今日のコーデ',
      'プチプラおすすめアイテム',
      'ファッションの悩み相談',
      '服選びのこだわり教えて',
      'セール情報共有',
    ],
  },
  photography: {
    education: [
      '構図の基本ルール解説',
      'スマホで撮れるプロ級写真テクニック',
      'ライティングの基礎知識',
      'レタッチの基本ステップ',
      'カメラ設定の基本と応用',
    ],
    inspiration: [
      '今日のベストショット',
      'お気に入りの撮影スポット',
      '写真で切り取る日常の美しさ',
      'カメラとの出会いの話',
      '季節の風景コレクション',
    ],
    connection: [
      'みんなの写真を見せて',
      'おすすめカメラ・レンズ',
      '撮影スポット情報交換',
      '写真の悩みを相談',
      'カメラ仲間募集',
    ],
  },
};

// ============================================================
// 週間カレンダー生成
// ============================================================

/**
 * 週間コンテンツカレンダーを生成する
 * @param startDate - 開始日（この日を含む週の月曜日から生成）
 * @param genre - ジャンル
 * @param postsPerWeek - 週間投稿数（デフォルト5）
 * @returns カレンダーエントリ配列
 */
export function generateWeeklyPlan(
  startDate: Date,
  genre: Genre,
  postsPerWeek: number = DEFAULT_POSTS_PER_WEEK,
): CalendarEntry[] {
  // 入力の投稿数を1-7の範囲に制限
  const clampedPosts = Math.max(1, Math.min(7, postsPerWeek));

  // 週の開始日（月曜）を取得
  const weekStart = startOfWeek(startDate, { weekStartsOn: 1 });

  // 投稿日を選定（投稿数に応じて均等に配分）
  const postingDays = selectPostingDays(weekStart, clampedPosts);

  // 各日にピラー・フォーマット・テーマを割り当て
  return postingDays.map((date, index) => {
    const pillar = assignPillar(index, clampedPosts);
    const dayOfWeek = date.getDay();
    const postFormat = selectFormat(pillar, dayOfWeek);
    const time = getOptimalTime(dayOfWeek, postFormat);
    const theme = suggestTheme(genre, pillar);
    const hookType = suggestHookType(pillar);

    return {
      id: generateId(),
      date: format(date, 'yyyy-MM-dd'),
      time,
      pillar,
      format: postFormat,
      theme,
      hookType,
      status: 'planned' as const,
    };
  });
}

// ============================================================
// 月間カレンダー生成
// ============================================================

/**
 * 月間コンテンツカレンダーを生成する（4週分）
 * @param startDate - 開始日
 * @param genre - ジャンル
 * @param postsPerWeek - 週間投稿数（デフォルト5）
 * @returns カレンダーエントリ配列
 */
export function generateMonthlyPlan(
  startDate: Date,
  genre: Genre,
  postsPerWeek: number = DEFAULT_POSTS_PER_WEEK,
): CalendarEntry[] {
  const entries: CalendarEntry[] = [];

  // 4週分を生成
  for (let week = 0; week < 4; week++) {
    const weekStart = addDays(startDate, week * 7);
    const weekEntries = generateWeeklyPlan(weekStart, genre, postsPerWeek);
    entries.push(...weekEntries);
  }

  return entries;
}

// ============================================================
// ピラー配分
// ============================================================

/**
 * インデックスに基づいてコンテンツピラーを割り当てる
 * 教育40% / インスピレーション30% / コネクション30%の比率を維持
 * @param index - 投稿のインデックス（0始まり）
 * @param total - 週間投稿総数
 * @returns 割り当てられたコンテンツピラー
 */
function assignPillar(index: number, total: number): ContentPillar {
  // 各ピラーの投稿数を計算
  const educationCount = Math.max(1, Math.round(total * PILLAR_DISTRIBUTION[0].weight));
  const inspirationCount = Math.max(1, Math.round(total * PILLAR_DISTRIBUTION[1].weight));

  // 教育 → インスピレーション → コネクション の順に割り当て
  if (index < educationCount) {
    return 'education';
  }
  if (index < educationCount + inspirationCount) {
    return 'inspiration';
  }
  return 'connection';
}

// ============================================================
// フォーマット選択
// ============================================================

/**
 * ピラーと曜日に基づいて投稿フォーマットを選択する
 * @param pillar - コンテンツピラー
 * @param dayOfWeek - 曜日（0=日, 6=土）
 * @returns 投稿フォーマット
 */
function selectFormat(pillar: ContentPillar, dayOfWeek: number): PostFormat {
  // ピラー別の推奨フォーマット
  const pillarFormats: Record<ContentPillar, PostFormat[]> = {
    education: ['carousel', 'carousel', 'image', 'reel'],   // カルーセル重視
    inspiration: ['reel', 'reel', 'image', 'carousel'],      // リール重視
    connection: ['image', 'reel', 'carousel', 'story'],       // バランス型
  };

  const formats = pillarFormats[pillar];

  // 曜日に応じて少しバリエーションを加える
  // 週末はリール、平日はカルーセル/画像が多い傾向
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // 週末: リールの優先度を上げる
    return Math.random() > 0.4 ? 'reel' : pick(formats);
  }

  return pick(formats);
}

// ============================================================
// 最適投稿時間
// ============================================================

/**
 * 曜日とフォーマットに基づいて最適な投稿時間を返す
 * @param dayOfWeek - 曜日（0=日, 6=土）
 * @param postFormat - 投稿フォーマット
 * @returns 投稿時間（HH:mm形式）
 */
function getOptimalTime(dayOfWeek: number, postFormat: PostFormat): string {
  const times = OPTIMAL_TIMES[dayOfWeek] ?? OPTIMAL_TIMES[1];
  const preferredIndex = FORMAT_TIME_PREFERENCE[postFormat] ?? 0;

  // 時間帯インデックスが範囲内であることを保証
  const safeIndex = Math.min(preferredIndex, times.length - 1);
  return times[safeIndex];
}

// ============================================================
// テーマ提案
// ============================================================

/**
 * ジャンルとピラーに基づいてテーマを提案する
 * 毎回異なるテーマが選ばれるようランダムに選択
 * @param genre - ジャンル
 * @param pillar - コンテンツピラー
 * @returns テーマ文字列
 */
function suggestTheme(genre: Genre, pillar: ContentPillar): string {
  const genreThemes = THEME_POOL[genre];
  if (!genreThemes) {
    // フォールバック: ライフスタイルのテーマを使用
    return pick(THEME_POOL.lifestyle[pillar]);
  }

  const themes = genreThemes[pillar];
  if (!themes || themes.length === 0) {
    return pick(THEME_POOL.lifestyle[pillar]);
  }

  return pick(themes);
}

// ============================================================
// フック類型提案
// ============================================================

/**
 * ピラーに基づいてフック類型を提案する
 * @param pillar - コンテンツピラー
 * @returns 推奨フック類型
 */
function suggestHookType(pillar: ContentPillar): HookType {
  const pillarHookMap: Record<ContentPillar, HookType[]> = {
    education: ['number', 'curiosity', 'question', 'shock'],
    inspiration: ['story', 'curiosity', 'number', 'shock'],
    connection: ['question', 'controversy', 'story', 'curiosity'],
  };

  const hookTypes = pillarHookMap[pillar];
  return pick(hookTypes);
}

// ============================================================
// 投稿日選定
// ============================================================

/**
 * 週内で均等に投稿日を選定する
 * @param weekStart - 週の開始日（月曜）
 * @param count - 投稿数
 * @returns 投稿日の配列
 */
function selectPostingDays(weekStart: Date, count: number): Date[] {
  // 月曜〜日曜の7日間
  const allDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  });

  if (count >= 7) {
    return allDays;
  }

  // 投稿数に応じた推奨曜日パターン
  const dayPatterns: Record<number, number[]> = {
    1: [1],                       // 月
    2: [1, 4],                    // 月・木
    3: [1, 3, 5],                 // 月・水・金
    4: [1, 2, 4, 6],              // 月・火・木・土
    5: [1, 2, 3, 4, 5],           // 月〜金
    6: [1, 2, 3, 4, 5, 6],        // 月〜土
  };

  const pattern = dayPatterns[count] ?? dayPatterns[5];

  return pattern.map((dayIndex) => allDays[dayIndex]).filter(Boolean);
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
