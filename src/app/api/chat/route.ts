// ============================================================
// AIコンサルタント チャットAPIルート
// 行動科学データをシステムプロンプトに注入したストリーミングチャット
// ============================================================

import {
  principles,
  hookPrincipleMap,
  actionPrincipleMap,
} from "@/engine/psychology/principles";
import { benchmarks } from "@/data/benchmarks";

// リクエストボディの型
interface ChatRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
  genre?: string;
}

// ジャンル表示名マップ
const genreDisplayNames: Record<string, string> = {
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

// システムプロンプトを動的構築
function buildSystemPrompt(genre?: string): string {
  // 心理原理の要約
  const principlesSummary = Object.values(principles)
    .map((p) => `- **${p.name}**（${p.nameEn}）: ${p.description} → 活用: ${p.application}`)
    .join("\n");

  // フック×原理マッピング
  const hookMapSummary = Object.entries(hookPrincipleMap)
    .map(([hook, ids]) => {
      const names = ids.map((id) => principles[id]?.name ?? id).join("、");
      return `- ${hook}: ${names}`;
    })
    .join("\n");

  // アクション×原理マッピング
  const actionMapSummary = Object.entries(actionPrincipleMap)
    .map(([action, ids]) => {
      const names = ids.map((id) => principles[id]?.name ?? id).join("、");
      return `- ${action}: ${names}`;
    })
    .join("\n");

  // ベンチマーク情報
  const benchmarkSummary = Object.values(benchmarks)
    .map(
      (b) =>
        `- ${b.label}（${b.range}フォロワー）: ER ${b.engagementRate.low}-${b.engagementRate.high}%, 保存率 ${b.saveRate.low}-${b.saveRate.high}%, シェア率 ${b.shareRate.low}-${b.shareRate.high}%`
    )
    .join("\n");

  // ユーザーのジャンル情報
  const genreContext = genre && genreDisplayNames[genre]
    ? `\nユーザーのメインジャンル: ${genreDisplayNames[genre]}`
    : "";

  return `あなたはInstagram成長戦略に特化したAIコンサルタントです。行動科学の知見を活用して、具体的で実践的なアドバイスを提供します。

## あなたの専門知識

### 行動科学10原理
${principlesSummary}

### フック類型×心理原理マッピング
各フック類型が活用する心理原理:
${hookMapSummary}

### 狙うアクション×心理原理マッピング
各目標アクション（保存/シェア/コメント/フォロー/クリック）に有効な心理原理:
${actionMapSummary}

### フォロワー規模別ベンチマーク
${benchmarkSummary}

### ハッシュタグ3層戦略
- ビッグタグ（投稿数100万+）: 3-4個 → 露出最大化
- ミドルタグ（投稿数1万-100万）: 4-5個 → 競争バランス
- ニッチタグ（投稿数1万以下）: 3-4個 → 上位表示狙い

### コンテンツピラー
投稿は以下の3ピラーで構成:
- **教育（Education）**: ノウハウ・Tips → 保存を促す
- **インスピレーション（Inspiration）**: モチベーション → シェアを促す
- **つながり（Connection）**: 共感・日常 → コメントを促す

### キャプション4幕構造
1. **フック**: 最初の1-2行でスクロールを止める
2. **ストーリー**: 共感・学び・驚きを展開
3. **価値提供**: 保存したくなる具体的ノウハウ
4. **CTA**: 狙うアクションに直結する行動喚起
${genreContext}

## 回答ルール
- 必ず行動科学の原理に基づいて回答する（どの原理を活用しているか明示）
- 具体的な数値・事例・テンプレートを含める
- Instagram特化の実践的アドバイスを提供する
- 初心者にもわかりやすい日本語で説明する
- フォロワー規模に応じたベンチマークを参照してアドバイスする
- 回答はマークダウン形式で構造化する`;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "your-api-key-here") {
      return new Response(
        JSON.stringify({
          error:
            "OpenAI APIキーが設定されていません。.env.localにOPENAI_API_KEYを設定してください。",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = (await request.json()) as ChatRequestBody;
    const { messages, genre } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "メッセージが必要です" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 直近20件に制限（トークン節約）
    const recentMessages = messages.slice(-20);
    const systemPrompt = buildSystemPrompt(genre);

    // OpenAI APIをストリーミングモードで呼び出し
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
            ...recentMessages,
          ],
          temperature: 0.7,
          max_tokens: 2000,
          stream: true,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorData = (await openaiResponse
        .json()
        .catch(() => ({}))) as Record<string, unknown>;
      const errorMessage =
        (errorData?.error as Record<string, unknown>)?.message ||
        `OpenAI API エラー (${openaiResponse.status})`;
      return new Response(
        JSON.stringify({ error: `AI応答に失敗しました: ${errorMessage}` }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // ストリーミングレスポンスをそのまま転送
    const stream = new ReadableStream({
      async start(controller) {
        const reader = openaiResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (line === "data: [DONE]") {
                controller.close();
                return;
              }

              if (line.startsWith("data: ")) {
                try {
                  const json = JSON.parse(line.slice(6)) as {
                    choices: { delta: { content?: string } }[];
                  };
                  const content = json.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(new TextEncoder().encode(content));
                  }
                } catch {
                  // パースエラーは無視して続行
                }
              }
            }
          }
        } catch {
          // ストリーム読み取りエラー
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "不明なエラーが発生しました";
    return new Response(
      JSON.stringify({ error: `チャットに失敗しました: ${message}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
