"use client";

/**
 * データエクスポートユーティリティ
 * キャプション、カレンダーのCSVエクスポートおよび全データJSON一括バックアップ機能
 */

import type { GeneratedCaption, CalendarEntry } from "@/lib/types";

/** ファイルをダウンロードするヘルパー */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** JSONとしてエクスポート */
export function exportAsJSON(data: unknown, filename: string) {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `${filename}.json`, "application/json");
}

/** CSV変換ヘルパー: オブジェクト配列 → CSV文字列（BOM付きUTF-8でExcel対応） */
function objectsToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((obj) =>
    headers
      .map((h) => {
        const val = obj[h];
        const str = val === null || val === undefined ? "" : String(val);
        // カンマ、改行、ダブルクォートを含む場合はダブルクォートで囲む
        return str.includes(",") || str.includes("\n") || str.includes('"')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      })
      .join(",")
  );
  // BOM付きUTF-8でExcel対応
  return "\uFEFF" + [headers.join(","), ...rows].join("\n");
}

/** CSVとしてエクスポート */
export function exportAsCSV(
  data: Record<string, unknown>[],
  filename: string
) {
  const csv = objectsToCSV(data);
  downloadFile(csv, `${filename}.csv`, "text/csv;charset=utf-8");
}

/** キャプション履歴をCSV用の行データに変換 */
export function captionsToCSVData(captions: GeneratedCaption[]) {
  return captions.map((c) => ({
    ID: c.id,
    ジャンル: c.input.genre,
    テーマ: c.input.theme,
    フック: c.hook,
    ストーリー: c.story,
    価値提供: c.value,
    CTA: c.cta,
    ハッシュタグ: c.hashtags?.join(" ") ?? "",
    作成日時: c.createdAt,
  }));
}

/** カレンダーエントリをCSV用の行データに変換 */
export function calendarToCSVData(entries: CalendarEntry[]) {
  return entries.map((e) => ({
    ID: e.id,
    日付: e.date,
    時間: e.time,
    テーマ: e.theme,
    ピラー: e.pillar,
    フォーマット: e.format,
    フックタイプ: e.hookType,
    ステータス: e.status,
  }));
}

/** 全データを一括JSONエクスポート */
export function exportAllData(allData: {
  captions: unknown[];
  calendar: unknown[];
  analysis: { posts: unknown[]; results: unknown };
  profile: unknown[];
  abtests: unknown[];
  reels: unknown[];
}) {
  const timestamp = new Date().toISOString().slice(0, 10);
  exportAsJSON(allData, `instagrowth-backup-${timestamp}`);
}
