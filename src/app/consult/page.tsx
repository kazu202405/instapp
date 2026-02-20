"use client";

import { useCallback, useRef } from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { ChatMessages } from "@/components/consult/ChatMessages";
import { ChatInput } from "@/components/consult/ChatInput";
import { useChatStore } from "@/store/chatStore";
import { useSettingsStore } from "@/store/settingsStore";

export default function ConsultPage() {
  const {
    messages,
    isStreaming,
    addMessage,
    updateLastAssistantMessage,
    clearMessages,
    setIsStreaming,
  } = useChatStore();
  const defaultGenre = useSettingsStore((s) => s.defaultGenre);
  const abortRef = useRef<AbortController | null>(null);

  // メッセージ送信＆ストリーミング受信
  const handleSend = useCallback(
    async (content: string) => {
      // ユーザーメッセージを追加
      const userMessage = {
        id: crypto.randomUUID(),
        role: "user" as const,
        content,
        createdAt: new Date().toISOString(),
      };
      addMessage(userMessage);

      // アシスタントメッセージの空プレースホルダーを追加
      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: "",
        createdAt: new Date().toISOString(),
      };
      addMessage(assistantMessage);

      setIsStreaming(true);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // チャットAPIにリクエスト
        const chatMessages = [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user" as const, content },
        ];

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: chatMessages,
            genre: defaultGenre || undefined,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(errorData.error || `エラー (${response.status})`);
        }

        // ストリーミングレスポンスを読み取り
        const reader = response.body?.getReader();
        if (!reader) throw new Error("レスポンスストリームが取得できません");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulated += decoder.decode(value, { stream: true });
          updateLastAssistantMessage(accumulated);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          // ユーザーによる中断 - 現在の内容をそのまま保持
        } else {
          const errorMsg =
            error instanceof Error ? error.message : "不明なエラー";
          updateLastAssistantMessage(
            `申し訳ありません。エラーが発生しました: ${errorMsg}`
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [
      messages,
      defaultGenre,
      addMessage,
      updateLastAssistantMessage,
      setIsStreaming,
    ]
  );

  // ストリーミング中断
  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return (
    <AnimatedPage>
      <div className="flex h-[calc(100svh-4rem)] flex-col md:h-svh">
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20">
              <MessageCircle className="h-4 w-4 text-pink-400" />
            </div>
            <h1 className="text-lg font-bold text-foreground">
              AIコンサルタント
            </h1>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearMessages}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="会話をクリア"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">クリア</span>
            </button>
          )}
        </div>

        {/* メッセージ一覧 */}
        <ChatMessages
          messages={messages}
          isStreaming={isStreaming}
          onQuickQuestion={handleSend}
        />

        {/* 入力エリア */}
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isStreaming={isStreaming}
        />
      </div>
    </AnimatedPage>
  );
}
