"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Target, Hash } from "lucide-react";

/**
 * キャプション生成中に表示するアニメーションコンポーネント
 * 各ステップを500msごとにサイクルしてフィードバックを提供
 */

const steps = [
  { icon: Sparkles, text: "フックを選択中...", color: "text-purple-400" },
  { icon: Brain, text: "ストーリーを構築中...", color: "text-pink-400" },
  { icon: Target, text: "CTAを最適化中...", color: "text-orange-400" },
  { icon: Hash, text: "ハッシュタグを選定中...", color: "text-blue-400" },
];

export function GeneratingAnimation() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div
      className="flex flex-col items-center justify-center py-16 gap-6"
      role="status"
      aria-label="キャプション生成中"
      aria-live="polite"
    >
      {/* アニメーションアイコン */}
      <div className="relative">
        {/* 背景のグロー */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20 blur-xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* アイコンコンテナ */}
        <motion.div
          className="relative flex size-20 items-center justify-center rounded-2xl bg-card/80 dark:bg-zinc-900/80 border border-border/50 backdrop-blur-sm"
          animate={{
            borderColor: [
              "rgba(147, 51, 234, 0.3)",
              "rgba(236, 72, 153, 0.3)",
              "rgba(249, 115, 22, 0.3)",
              "rgba(59, 130, 246, 0.3)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Icon className={`size-8 ${step.color}`} aria-hidden="true" />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ステップテキスト */}
      <div className="h-6 flex items-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStep}
            className={`text-sm font-medium ${step.color}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {step.text}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* プログレスドット */}
      <div className="flex items-center gap-2" aria-hidden="true">
        {steps.map((_, index) => (
          <motion.div
            key={index}
            className="size-1.5 rounded-full"
            animate={{
              backgroundColor:
                index === currentStep
                  ? "rgb(168, 85, 247)"
                  : "rgb(63, 63, 70)",
              scale: index === currentStep ? 1.5 : 1,
            }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}
