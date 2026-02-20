// ============================================================
// InstaGrowth - プロフィール最適化ストア
// プロフィールチェックリスト管理のZustand永続化ストア
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProfileCheckItem } from '@/lib/types';

// プロフィールストアのインターフェース
interface ProfileStore {
  // 状態
  checkItems: ProfileCheckItem[]; // チェックリスト項目

  // 操作
  setCheckItems: (items: ProfileCheckItem[]) => void;
  toggleItem: (id: string) => void;
  resetAll: () => void;
}

// デフォルトのチェックリスト項目
// 行動科学に基づくInstagramプロフィール最適化チェックリスト
const defaultCheckItems: ProfileCheckItem[] = [
  // ── name（名前）──
  {
    id: 'name-keyword',
    category: 'name',
    label: '名前に検索キーワードを含めている',
    description: '名前フィールドにジャンルキーワードを追加（例：太郎｜筋トレコーチ）',
    psychologyReason: '検索ヒューリスティクス：ユーザーはキーワードで検索するため、名前に含めることで発見率が向上',
    completed: false,
    weight: 8,
  },
  {
    id: 'name-readable',
    category: 'name',
    label: '名前が読みやすく覚えやすい',
    description: '複雑な英字や特殊文字を避け、直感的に読める名前にする',
    psychologyReason: '処理流暢性：読みやすい名前は好意的に評価され、記憶に残りやすい',
    completed: false,
    weight: 6,
  },

  // ── bio（自己紹介）──
  {
    id: 'bio-value',
    category: 'bio',
    label: '提供価値が明確に書かれている',
    description: 'このアカウントをフォローすると何が得られるかを1行で伝える',
    psychologyReason: 'フレーミング効果：フォローのメリットを明示することで行動を促す',
    completed: false,
    weight: 10,
  },
  {
    id: 'bio-target',
    category: 'bio',
    label: 'ターゲット層が明確',
    description: '誰に向けた発信かを明記（例：「30代の働くママへ」）',
    psychologyReason: 'アイデンティティバイアス：自分に該当すると感じた人は強く反応する',
    completed: false,
    weight: 9,
  },
  {
    id: 'bio-credential',
    category: 'bio',
    label: '実績・権威性を示している',
    description: '数字や資格で信頼性を示す（例：「フォロワー1万人達成」「管理栄養士」）',
    psychologyReason: '権威バイアス：専門性や実績がある人の情報は信頼されやすい',
    completed: false,
    weight: 8,
  },
  {
    id: 'bio-emoji',
    category: 'bio',
    label: '絵文字で視覚的に整理されている',
    description: '各行の先頭に絵文字をつけて、スキャンしやすくする',
    psychologyReason: 'ビジュアル処理優位性：テキストより視覚要素の方が早く処理される',
    completed: false,
    weight: 5,
  },

  // ── cta（行動喚起）──
  {
    id: 'cta-link',
    category: 'cta',
    label: 'プロフィールにリンクを設置している',
    description: 'Linktreeやlit.linkなどで複数リンクを集約',
    psychologyReason: '好奇心ギャップ：リンク先の情報に興味を持たせクリックを促す',
    completed: false,
    weight: 7,
  },
  {
    id: 'cta-action',
    category: 'cta',
    label: 'アクションを促す一文がある',
    description: '「詳しくはリンクから」「DMでお気軽に」など具体的な行動指示',
    psychologyReason: '行動の明確化：具体的な指示があると行動に移しやすい',
    completed: false,
    weight: 7,
  },

  // ── photo（プロフィール写真）──
  {
    id: 'photo-face',
    category: 'photo',
    label: '顔写真またはブランドロゴを使用している',
    description: '個人は顔写真、ビジネスはロゴを高解像度で設定',
    psychologyReason: '顔認知バイアス：人間の脳は顔に自動的に注目し信頼を構築する',
    completed: false,
    weight: 9,
  },
  {
    id: 'photo-bright',
    category: 'photo',
    label: '明るくクリアな画像を使用している',
    description: '暗い写真やぼやけた画像は避け、明るく鮮明な写真を使用',
    psychologyReason: '処理流暢性：明るくクリアな画像は好意的な印象を与える',
    completed: false,
    weight: 6,
  },

  // ── highlights（ハイライト）──
  {
    id: 'highlights-organized',
    category: 'highlights',
    label: 'ハイライトがカテゴリ別に整理されている',
    description: '自己紹介、よくある質問、お客様の声などをハイライトで分類',
    psychologyReason: '認知負荷の軽減：整理された情報は理解しやすく滞在時間が延びる',
    completed: false,
    weight: 7,
  },
  {
    id: 'highlights-cover',
    category: 'highlights',
    label: 'ハイライトのカバー画像が統一されている',
    description: '同じデザインテイストのカバー画像を設定し、ブランド感を統一',
    psychologyReason: '一貫性バイアス：統一感があるとプロフェッショナルに見える',
    completed: false,
    weight: 5,
  },

  // ── pinned（固定投稿）──
  {
    id: 'pinned-best',
    category: 'pinned',
    label: '固定投稿にベストコンテンツを設定している',
    description: '最もエンゲージメントが高い投稿や自己紹介投稿を固定',
    psychologyReason: '初頭効果：最初に見るコンテンツが全体の印象を決定する',
    completed: false,
    weight: 8,
  },
  {
    id: 'pinned-variety',
    category: 'pinned',
    label: '固定投稿で発信内容の多様性を示している',
    description: '異なるコンテンツピラーの投稿を固定し、アカウントの魅力を網羅',
    psychologyReason: 'バラエティ効果：多様な価値を示すことでフォローの動機を増やす',
    completed: false,
    weight: 6,
  },
];

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      // 初期状態（デフォルトチェックリストを使用）
      checkItems: defaultCheckItems,

      // チェックリスト項目を一括設定（カスタマイズ時に使用）
      setCheckItems: (items) =>
        set({ checkItems: items }),

      // 指定IDの項目の完了状態をトグル
      toggleItem: (id) =>
        set((state) => ({
          checkItems: state.checkItems.map((item) =>
            item.id === id ? { ...item, completed: !item.completed } : item
          ),
        })),

      // 全項目を未完了にリセット
      resetAll: () =>
        set((state) => ({
          checkItems: state.checkItems.map((item) => ({
            ...item,
            completed: false,
          })),
        })),
    }),
    {
      name: 'instagrowth-profile',
    }
  )
);
