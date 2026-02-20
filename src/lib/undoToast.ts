// ============================================================
// InstaGrowth - Undoトーストユーティリティ
// 削除操作の取り消し機能を提供するトースト通知
// ============================================================

import { toast } from "sonner";

/**
 * 削除操作のUndoトースト表示
 * 指定時間内に「元に戻す」をクリックすると、onUndoコールバックが実行される
 *
 * @param message - 表示メッセージ
 * @param onUndo - Undo時のコールバック（アイテム復元処理）
 * @param duration - トースト表示時間（ms）、デフォルト5000ms
 */
export function showUndoToast(
  message: string,
  onUndo: () => void,
  duration: number = 5000
) {
  toast(message, {
    duration,
    action: {
      label: "元に戻す",
      onClick: onUndo,
    },
  });
}
