"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Instagram風グラデーションのローディングスピナー
 * サイズバリエーション: sm(16px), md(32px), lg(48px)
 */
export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "size-4",
    md: "size-8",
    lg: "size-12",
  };

  return (
    <div
      className={cn("relative", sizeClasses[size], className)}
      role="status"
      aria-label="読み込み中"
    >
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 border-r-pink-500 animate-spin" />
      <span className="sr-only">読み込み中</span>
    </div>
  );
}
