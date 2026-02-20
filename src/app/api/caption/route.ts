// ============================================================
// GPTキャプション生成APIルート
// OpenAI GPT-4o-miniを使用して行動科学ベースのキャプションを生成
// ============================================================

import { NextResponse } from "next/server";
import type {
  CaptionInput,
  GeneratedCaption,
  Genre,
  HookType,
  TargetAction,
  StoryStructure,
} from "@/lib/types";

// ジャンル表示名マップ
const genreDisplayNames: Record<Genre, string> = {
  fitness: "フィットネス",
  food: "料理・グルメ",
  travel: "旅行",
  beauty: "美容",
  business: "ビジネス",
  lifestyle: "ライフスタイル",
  tech: "テクノロジー",
  education: "学び・教育",
  fashion: "ファッション",
  photography: "写真",
};

// フックタイプ表示名マップ
const hookTypeDisplayNames: Record<HookType, string> = {
  curiosity: "好奇心ギャップ",
  controversy: "議論・逆張り",
  story: "ストーリー",
  number: "数字インパクト",
  question: "問いかけ",
  shock: "衝撃・暴露",
};

// ターゲットアクション表示名マップ
const targetActionDisplayNames: Record<TargetAction, string> = {
  save: "保存",
  share: "シェア",
  comment: "コメント",
  follow: "フォロー",
  click: "リンククリック",
};

// フックタイプと行動科学原理のマッピング
const hookPsychology: Record<HookType, string> = {
  curiosity: "好奇心ギャップ + ツァイガルニク効果（未完了の情報に対する心理的欲求を利用）",
  controversy: "アイデンティティバイアス + 社会的証明（自分の信念に関わる議論は無視できない）",
  story: "ストーリーバイアス + 返報性（物語は脳に深く刻まれ、共感を生む）",
  number: "アンカリング効果 + 社会的証明（具体的な数字が信頼性と説得力を高める）",
  question: "好奇心ギャップ + アイデンティティバイアス（問いかけは自分事化を促進する）",
  shock: "好奇心ギャップ + 損失回避（衝撃的な事実は「知らないと損」という感覚を生む）",
};

// ターゲットアクションと行動科学原理のマッピング
const actionPsychology: Record<TargetAction, string> = {
  save: "保有効果 + 損失回避 + 返報性（価値ある情報を失いたくない心理を刺激）",
  share: "社会的証明 + アイデンティティバイアス（共有することで自己表現したい欲求）",
  comment: "好奇心ギャップ + アイデンティティバイアス（意見を言いたくなる問いかけ）",
  follow: "返報性 + 社会的証明 + 希少性（継続的な価値提供への期待感）",
  click: "好奇心ギャップ + 希少性 + 損失回避（限定情報へのアクセス欲求）",
};

// 有効なStoryStructure値
const validStoryStructures: StoryStructure[] = [
  "education",
  "narrative",
  "empathy",
  "authority",
  "lossAversion",
];

// 一意ID生成
function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// システムプロンプト生成
function buildSystemPrompt(input: CaptionInput): string {
  const genreName = genreDisplayNames[input.genre];
  const hookName = hookTypeDisplayNames[input.hookType];
  const actionName = targetActionDisplayNames[input.targetAction];
  const hookPsych = hookPsychology[input.hookType];
  const actionPsych = actionPsychology[input.targetAction];

  return `あなたはInstagram成長の専門家であり、行動科学をキャプション設計に応用するプロフェッショナルです。

## あなたの役割
行動科学の原理を活用して、ユーザーの特定のアクション（${actionName}）を最大化するInstagramキャプションを生成します。

## キャプション4幕構造
すべてのキャプションは以下の4パートで構成してください:
1. **フック（hook）**: 最初の1-2行で読者の手を止める。スクロールを止めさせる力が最重要。
2. **ストーリー（story）**: フックの続きとして、共感・学び・驚きを展開する。3-5行程度。
3. **価値提供（value）**: 読者が「保存したい」と思う具体的な価値やノウハウ。3-5行程度。
4. **CTA（cta）**: 狙うアクション「${actionName}」に直結する行動喚起。1-2行。

## 今回の設定
- ジャンル: ${genreName}
- フックタイプ: ${hookName}
- 狙うアクション: ${actionName}
- フックの心理学: ${hookPsych}
- CTAの心理学: ${actionPsych}
${input.includeEmoji ? "- 絵文字を効果的に使用してください" : "- 絵文字は使用しないでください"}

## ハッシュタグ戦略（3層構造）
各キャプションに10-15個のハッシュタグを付けてください:
- ビッグタグ（投稿数100万+）: 3-4個（露出用）
- ミドルタグ（投稿数1万-100万）: 4-5個（競争バランス）
- ニッチタグ（投稿数1万以下）: 3-4個（上位表示狙い）
すべて日本語のハッシュタグにしてください。#を含めてください。

## storyStructure値
以下のいずれかを選択してください:
- "education": 教育型（ステップバイステップ、リスト形式）
- "narrative": 物語型（体験談、ビフォーアフター）
- "empathy": 共感型（あるある、悩み共有）
- "authority": 権威型（データ、専門知識）
- "lossAversion": 損失回避型（知らないと損する情報）

## 出力形式
以下のJSON形式で3つのバリエーションを生成してください。JSONのみを出力し、他のテキストは含めないでください。

\`\`\`json
{
  "variants": [
    {
      "hook": "フック文（1-2行）",
      "story": "ストーリー部分（3-5行）",
      "value": "価値提供部分（3-5行）",
      "cta": "CTA文（1-2行）",
      "hashtags": ["#タグ1", "#タグ2", "..."],
      "hookReason": "このフックが効果的な行動科学的理由",
      "ctaReason": "このCTAが${actionName}を促す行動科学的理由",
      "storyStructure": "education|narrative|empathy|authority|lossAversion"
    }
  ]
}
\`\`\`

3つのバリエーションはそれぞれ異なるアプローチで作成してください:
- バリエーション1: 最もオーソドックスで効果的なアプローチ
- バリエーション2: やや攻めた・個性的なアプローチ
- バリエーション3: 感情に強く訴えるアプローチ`;
}

// ユーザープロンプト生成
function buildUserPrompt(input: CaptionInput): string {
  const genreName = genreDisplayNames[input.genre];
  const hookName = hookTypeDisplayNames[input.hookType];
  const actionName = targetActionDisplayNames[input.targetAction];
  const keywordsStr =
    input.keywords.length > 0 ? input.keywords.join("、") : "なし";

  return `以下の条件でInstagramキャプションを3つ生成してください。

ジャンル: ${genreName}
テーマ: ${input.theme}
キーワード: ${keywordsStr}
フックタイプ: ${hookName}
狙うアクション: ${actionName}
絵文字: ${input.includeEmoji ? "あり" : "なし"}

JSON形式で出力してください。`;
}

// GPTレスポンスのバリエーション型
interface GptVariant {
  hook: string;
  story: string;
  value: string;
  cta: string;
  hashtags: string[];
  hookReason: string;
  ctaReason: string;
  storyStructure: string;
}

// GPTレスポンスのパースと変換
function parseGptResponse(
  responseText: string,
  input: CaptionInput
): GeneratedCaption[] {
  // JSONブロックを抽出（```json...```で囲まれている場合に対応）
  let jsonStr = responseText.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  const parsed = JSON.parse(jsonStr) as { variants: GptVariant[] };

  if (!parsed.variants || !Array.isArray(parsed.variants)) {
    throw new Error("GPTレスポンスの形式が不正です");
  }

  return parsed.variants.map((variant) => {
    // storyStructureのバリデーション
    const structure = validStoryStructures.includes(
      variant.storyStructure as StoryStructure
    )
      ? (variant.storyStructure as StoryStructure)
      : "education";

    // 全文組み立て
    const separator = input.includeEmoji ? "- - - - - -" : "";
    const parts = [
      variant.hook,
      separator,
      variant.story,
      separator,
      variant.value,
      separator,
      variant.cta,
      "",
      variant.hashtags.join(" "),
    ].filter((part) => part !== "");

    const fullCaption = parts.join("\n\n");

    return {
      id: generateId(),
      hook: variant.hook,
      story: variant.story,
      value: variant.value,
      cta: variant.cta,
      fullCaption,
      hashtags: variant.hashtags,
      hookReason: variant.hookReason,
      ctaReason: variant.ctaReason,
      storyStructure: structure,
      input,
      createdAt: new Date().toISOString(),
    };
  });
}

// CaptionInputのバリデーション
function validateInput(
  body: Record<string, unknown>
): CaptionInput | { error: string } {
  const validGenres: Genre[] = [
    "fitness",
    "food",
    "travel",
    "beauty",
    "business",
    "lifestyle",
    "tech",
    "education",
    "fashion",
    "photography",
  ];
  const validHookTypes: HookType[] = [
    "curiosity",
    "controversy",
    "story",
    "number",
    "question",
    "shock",
  ];
  const validTargetActions: TargetAction[] = [
    "save",
    "share",
    "comment",
    "follow",
    "click",
  ];

  const { genre, theme, keywords, targetAction, hookType, includeEmoji } = body;

  if (!genre || !validGenres.includes(genre as Genre)) {
    return { error: "無効なジャンルです" };
  }
  if (!theme || typeof theme !== "string" || (theme as string).trim() === "") {
    return { error: "テーマを入力してください" };
  }
  if (!hookType || !validHookTypes.includes(hookType as HookType)) {
    return { error: "無効なフックタイプです" };
  }
  if (
    !targetAction ||
    !validTargetActions.includes(targetAction as TargetAction)
  ) {
    return { error: "無効なターゲットアクションです" };
  }

  return {
    genre: genre as Genre,
    theme: (theme as string).trim(),
    keywords: Array.isArray(keywords)
      ? (keywords as string[]).filter((k) => typeof k === "string" && k.trim())
      : [],
    targetAction: targetAction as TargetAction,
    hookType: hookType as HookType,
    includeEmoji: typeof includeEmoji === "boolean" ? includeEmoji : true,
  };
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "your-api-key-here") {
      return NextResponse.json(
        { error: "OpenAI APIキーが設定されていません。.env.localにOPENAI_API_KEYを設定してください。" },
        { status: 500 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const validationResult = validateInput(body);

    if ("error" in validationResult) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    const input: CaptionInput = validationResult;
    const systemPrompt = buildSystemPrompt(input);
    const userPrompt = buildUserPrompt(input);

    // OpenAI API呼び出し
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.8,
          max_tokens: 4000,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorData = (await openaiResponse.json().catch(() => ({}))) as Record<string, unknown>;
      const errorMessage =
        (errorData?.error as Record<string, unknown>)?.message ||
        `OpenAI API エラー (${openaiResponse.status})`;
      return NextResponse.json(
        { error: `AI生成に失敗しました: ${errorMessage}` },
        { status: 502 }
      );
    }

    const data = (await openaiResponse.json()) as {
      choices: { message: { content: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "AIからの応答が空でした" },
        { status: 502 }
      );
    }

    // GPTレスポンスをパースしてGeneratedCaption配列に変換
    const captions = parseGptResponse(content, input);

    return NextResponse.json({ captions });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "不明なエラーが発生しました";
    return NextResponse.json(
      { error: `キャプション生成に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}
