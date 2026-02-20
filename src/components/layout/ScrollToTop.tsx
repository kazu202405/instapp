"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * ルート変更時にページトップへスクロールするコンポーネント
 * ナビゲーション時に即座にスクロール位置をリセット
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
