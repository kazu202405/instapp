"use client";

import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { ChatBubble } from "@/components/consult/ChatBubble";
import { QuickQuestions } from "@/components/consult/QuickQuestions";
import type { ChatMessage } from "@/lib/types";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onQuickQuestion: (question: string) => void;
}

export function ChatMessages({
  messages,
  isStreaming,
  onQuickQuestion,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // 新しいメッセージが追加されたら自動スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 空状態
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        {/* ウェルカムメッセージ */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20">
            <MessageCircle className="h-8 w-8 text-pink-400" />
          </div>
          <h2 className="text-lg font-bold text-foreground">
            AIコンサルタント
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            行動科学に基づいたInstagram成長戦略をアドバイスします。
            <br />
            フック設計、CTA最適化、ハッシュタグ戦略など、何でもご相談ください。
          </p>
        </div>

        {/* クイック質問 */}
        <div className="w-full max-w-lg">
          <p className="mb-2 text-center text-xs text-muted-foreground">
            よくある質問
          </p>
          <QuickQuestions onSelect={onQuickQuestion} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {/* ストリーミング中のタイピングインジケーター */}
        {isStreaming &&
          messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-card px-4 py-3">
                <div className="h-2 w-2 animate-bounce rounded-full bg-pink-400 [animation-delay:-0.3s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-pink-400 [animation-delay:-0.15s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-pink-400" />
              </div>
            </div>
          )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
