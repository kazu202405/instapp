"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * パーティクルの型定義
 */
interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
  isCircle: boolean;
}

/**
 * 紙吹雪エフェクトコンポーネント
 * マイルストーン達成時にtriggerがtrueになると紙吹雪アニメーションを表示
 * 2.5秒後に自動的にクリーンアップされる
 */
export function Confetti({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;

    // Instagramブランドカラーをベースにした紙吹雪の色
    const colors = [
      "#833AB4",
      "#E1306C",
      "#F77737",
      "#FCAF45",
      "#8a3ab9",
      "#bc2a8d",
      "#e95950",
      "#fccc63",
    ];

    const newParticles: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.3,
      size: Math.random() * 8 + 4,
      isCircle: Math.random() > 0.5,
    }));

    setParticles(newParticles);

    // アニメーション終了後にパーティクルをクリーンアップ
    const timer = setTimeout(() => setParticles([]), 2500);
    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div
          className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
          aria-hidden="true"
        >
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                x: `${p.x}vw`,
                y: -20,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: "110vh",
                rotate: Math.random() * 720 - 360,
                opacity: [1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2 + Math.random(),
                delay: p.delay,
                ease: "easeIn",
              }}
              style={{
                position: "absolute",
                width: p.size,
                height: p.size,
                borderRadius: p.isCircle ? "50%" : "2px",
                backgroundColor: p.color,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
