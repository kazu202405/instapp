"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}

export function ChatInput({ onSend, onStop, isStreaming }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // テキストエリア自動リサイズ
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    // 1行〜4行の範囲でリサイズ
    const lineHeight = 24;
    const maxHeight = lineHeight * 4;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setInput("");
    // リサイズリセット
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, isStreaming, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // IME変換中はEnterを無視
    if (isComposing) return;
    // Shift+Enterは改行
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-background/80 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder="Instagram戦略について質問してください..."
          rows={1}
          className={cn(
            "flex-1 resize-none rounded-xl border border-border bg-card px-4 py-2.5",
            "text-sm text-foreground placeholder:text-muted-foreground",
            "focus:border-pink-500/50 focus:outline-none focus:ring-1 focus:ring-pink-500/50",
            "transition-colors duration-200"
          )}
          disabled={isStreaming}
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/80 text-white transition-colors hover:bg-red-500"
            aria-label="生成を中断"
          >
            <Square className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
              input.trim()
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90"
                : "bg-muted text-muted-foreground"
            )}
            aria-label="送信"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
