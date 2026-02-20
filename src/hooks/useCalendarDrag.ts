"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useCalendarStore } from "@/store/calendarStore";

/**
 * カレンダーのドラッグ&ドロップを管理するカスタムフック
 * HTML5 Drag and Drop API + タッチデバイス対応（長押し500ms）
 */
export function useCalendarDrag() {
  // ドラッグ中のエントリID
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  // ドロップターゲットの日付
  const [dropTargetDate, setDropTargetDate] = useState<string | null>(null);
  // ドロップ成功フラッシュの日付
  const [flashDate, setFlashDate] = useState<string | null>(null);

  // タッチ長押し用タイマー
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // タッチ開始位置
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  // タッチドラッグ中フラグ
  const isTouchDraggingRef = useRef(false);

  const { updateEntry } = useCalendarStore();

  // === デスクトップ: HTML5 Drag and Drop ===

  /** ドラッグ開始 */
  const onDragStart = useCallback(
    (e: React.DragEvent<HTMLElement>, entryId: string) => {
      setDragItemId(entryId);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", entryId);

      // ドラッグゴーストの透明度を調整
      const target = e.currentTarget as HTMLElement;
      if (target) {
        requestAnimationFrame(() => {
          target.style.opacity = "0.5";
        });
      }
    },
    [],
  );

  /** ドラッグオーバー（ドロップターゲットのハイライト） */
  const onDragOver = useCallback(
    (e: React.DragEvent<HTMLElement>, date: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDropTargetDate(date);
    },
    [],
  );

  /** ドラッグがターゲットから離れた時 */
  const onDragLeave = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      // 子要素への移動でleaveが発火するのを防止
      const relatedTarget = e.relatedTarget as Node | null;
      if (
        relatedTarget &&
        e.currentTarget.contains(relatedTarget)
      ) {
        return;
      }
      setDropTargetDate(null);
    },
    [],
  );

  /** ドロップ処理 */
  const onDrop = useCallback(
    (e: React.DragEvent<HTMLElement>, targetDate: string) => {
      e.preventDefault();
      const entryId = e.dataTransfer.getData("text/plain");

      if (entryId) {
        updateEntry(entryId, { date: targetDate });
        toast.success("予定を移動しました");

        // フラッシュアニメーション
        setFlashDate(targetDate);
        setTimeout(() => setFlashDate(null), 600);
      }

      setDragItemId(null);
      setDropTargetDate(null);
    },
    [updateEntry],
  );

  /** ドラッグ終了（クリーンアップ） */
  const onDragEnd = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      // 透明度を元に戻す
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.opacity = "";
      }
      setDragItemId(null);
      setDropTargetDate(null);
    },
    [],
  );

  // === タッチデバイス: 長押しでドラッグ開始 ===

  /** タッチ開始 - 500ms長押しでドラッグモードに入る */
  const onTouchStart = useCallback(
    (entryId: string, e: React.TouchEvent<HTMLElement>) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      isTouchDraggingRef.current = false;

      touchTimerRef.current = setTimeout(() => {
        isTouchDraggingRef.current = true;
        setDragItemId(entryId);

        // 長押し開始をバイブレーションで通知（対応デバイスのみ）
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 500);
    },
    [],
  );

  /** タッチ移動 - 長押し前に動いたらキャンセル */
  const onTouchMove = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (!isTouchDraggingRef.current && touchTimerRef.current) {
        const touch = e.touches[0];
        const start = touchStartRef.current;
        if (start) {
          const dx = Math.abs(touch.clientX - start.x);
          const dy = Math.abs(touch.clientY - start.y);
          // 10px以上動いたらキャンセル
          if (dx > 10 || dy > 10) {
            clearTimeout(touchTimerRef.current);
            touchTimerRef.current = null;
          }
        }
      }

      // ドラッグ中: 指の下にある日付セルを検出
      if (isTouchDraggingRef.current) {
        e.preventDefault();
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);

        if (element) {
          // data-date属性を持つ親要素を探す
          const dateCell = element.closest("[data-date]") as HTMLElement | null;
          if (dateCell) {
            const date = dateCell.getAttribute("data-date");
            setDropTargetDate(date);
          } else {
            setDropTargetDate(null);
          }
        }
      }
    },
    [],
  );

  /** タッチ終了 - ドロップ処理 */
  const onTouchEnd = useCallback(() => {
    // 長押しタイマーをクリア
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }

    // ドラッグ中だった場合はドロップ処理
    if (isTouchDraggingRef.current && dragItemId && dropTargetDate) {
      updateEntry(dragItemId, { date: dropTargetDate });
      toast.success("予定を移動しました");

      // フラッシュアニメーション
      setFlashDate(dropTargetDate);
      setTimeout(() => setFlashDate(null), 600);
    }

    isTouchDraggingRef.current = false;
    setDragItemId(null);
    setDropTargetDate(null);
    touchStartRef.current = null;
  }, [dragItemId, dropTargetDate, updateEntry]);

  return {
    // 状態
    dragItemId,
    dropTargetDate,
    flashDate,

    // デスクトップ用ハンドラ
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,

    // タッチ用ハンドラ
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
