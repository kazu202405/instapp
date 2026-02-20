// ============================================================
// InstaGrowth - チャットストア
// AIコンサルタントのチャット履歴をZustand永続化ストアで管理
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage } from "@/lib/types";

// チャットストアのインターフェース
interface ChatStore {
  // 状態
  messages: ChatMessage[];
  isStreaming: boolean;

  // 操作
  addMessage: (message: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  clearMessages: () => void;
  setIsStreaming: (streaming: boolean) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      // 初期状態
      messages: [],
      isStreaming: false,

      // メッセージを追加
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      // ストリーミング中にアシスタントの最後のメッセージを更新
      updateLastAssistantMessage: (content) =>
        set((state) => {
          const messages = [...state.messages];
          for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === "assistant") {
              messages[i] = { ...messages[i], content };
              break;
            }
          }
          return { messages };
        }),

      // 全メッセージをクリア
      clearMessages: () => set({ messages: [], isStreaming: false }),

      // ストリーミング状態を設定
      setIsStreaming: (streaming) => set({ isStreaming: streaming }),
    }),
    {
      name: "instagrowth-chat",
      // isStreamingは永続化対象外
      partialize: (state) => ({
        messages: state.messages,
      }),
    }
  )
);
