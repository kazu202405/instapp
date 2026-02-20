"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

interface ChatBubbleProps {
  message: ChatMessage;
}

// 簡易マークダウンレンダリング
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let listKey = 0;

  const flushList = () => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="my-1 ml-4 list-disc space-y-0.5">
          {listBuffer.map((item, i) => (
            <li key={i}>{formatInline(item)}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 見出し
    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h4 key={i} className="mt-3 mb-1 text-sm font-bold text-foreground">
          {formatInline(line.slice(4))}
        </h4>
      );
    } else if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h3 key={i} className="mt-3 mb-1 font-bold text-foreground">
          {formatInline(line.slice(3))}
        </h3>
      );
    } else if (line.startsWith("# ")) {
      flushList();
      elements.push(
        <h2 key={i} className="mt-3 mb-1 text-lg font-bold text-foreground">
          {formatInline(line.slice(2))}
        </h2>
      );
    }
    // リスト項目
    else if (/^[-*] /.test(line)) {
      listBuffer.push(line.slice(2));
    } else if (/^\d+\. /.test(line)) {
      // 番号付きリストはフラッシュしてから個別処理
      flushList();
      if (!elements.length || typeof elements[elements.length - 1] !== "object") {
        // 新しい番号リストの開始
      }
      listBuffer.push(line.replace(/^\d+\.\s*/, ""));
      // 次の行が番号リストでなければフラッシュ
      if (i + 1 >= lines.length || !/^\d+\. /.test(lines[i + 1])) {
        elements.push(
          <ol key={`ol-${listKey++}`} className="my-1 ml-4 list-decimal space-y-0.5">
            {listBuffer.map((item, j) => (
              <li key={j}>{formatInline(item)}</li>
            ))}
          </ol>
        );
        listBuffer = [];
      }
    }
    // 空行
    else if (line.trim() === "") {
      flushList();
      elements.push(<div key={i} className="h-2" />);
    }
    // 通常テキスト
    else {
      flushList();
      elements.push(
        <p key={i} className="leading-relaxed">
          {formatInline(line)}
        </p>
      );
    }
  }
  flushList();

  return elements;
}

// インラインフォーマット（太字）
function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:max-w-[75%]",
          isUser
            ? "bg-gradient-to-br from-purple-600 to-pink-500 text-white"
            : "border border-border bg-card text-foreground"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        ) : (
          <div className="space-y-0.5">{renderMarkdown(message.content)}</div>
        )}
      </div>
    </motion.div>
  );
}
