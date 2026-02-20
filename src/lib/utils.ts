import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

/**
 * クラス名を結合するユーティリティ（shadcn/ui標準）
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * テキストをクリップボードにコピーする
 * @param text - コピーするテキスト
 * @returns コピー成功時true、失敗時false
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // フォールバック: execCommand を使用
    try {
      const textarea = document.createElement("textarea")
      textarea.value = text
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      textarea.style.pointerEvents = "none"
      document.body.appendChild(textarea)
      textarea.select()
      const success = document.execCommand("copy")
      document.body.removeChild(textarea)
      return success
    } catch {
      return false
    }
  }
}

/**
 * 日付をフォーマットする（日本語ロケール対応）
 * @param date - フォーマット対象の日付（Date, 文字列, タイムスタンプ）
 * @param formatStr - date-fns形式のフォーマット文字列（デフォルト: "yyyy/MM/dd"）
 * @returns フォーマット済み日付文字列
 */
export function formatDate(
  date: Date | string | number,
  formatStr: string = "yyyy/MM/dd"
): string {
  const dateObj = typeof date === "string" || typeof date === "number"
    ? new Date(date)
    : date

  return format(dateObj, formatStr, { locale: ja })
}
