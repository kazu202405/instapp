"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login } = useAuthStore();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ハイドレーション対策: クライアントでマウント後にのみ判定
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const success = login(password);
      if (!success) {
        setError(true);
        setPassword("");
        setTimeout(() => setError(false), 2000);
      }
    },
    [password, login]
  );

  // マウント前はローディング表示（ハイドレーションミスマッチ防止）
  if (!mounted) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  // 認証済みならアプリを表示
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // ログイン画面
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* ロゴ */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 shadow-lg shadow-purple-900/30">
            <Sparkles className="size-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            InstaGrowth
          </h1>
          <p className="text-sm text-muted-foreground">
            パスワードを入力してください
          </p>
        </div>

        {/* ログインフォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              autoFocus
              className="pl-10 h-12 bg-card/80 dark:bg-zinc-900/50 border-border/50 text-base"
              aria-label="パスワード"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-400 text-center"
            >
              パスワードが違います
            </motion.p>
          )}

          <Button
            type="submit"
            disabled={!password.trim()}
            className="w-full h-12 rounded-xl text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:shadow-purple-900/30 active:scale-[0.98] transition-all disabled:opacity-40"
          >
            <ArrowRight className="mr-2 size-5" />
            ログイン
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
