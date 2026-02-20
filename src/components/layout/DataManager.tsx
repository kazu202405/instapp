"use client";

import { useState, useCallback, useRef } from "react";
import {
  Database,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  exportAsCSV,
  captionsToCSVData,
  calendarToCSVData,
  exportAllData,
} from "@/lib/exportData";
import { useCaptionStore } from "@/store/captionStore";
import { useCalendarStore } from "@/store/calendarStore";
import { useAnalysisStore } from "@/store/analysisStore";
import { useProfileStore } from "@/store/profileStore";
import { useABTestStore } from "@/store/abtestStore";
import { useReelStore } from "@/store/reelStore";

// localStorageのストアキー一覧
const STORE_KEYS = [
  "instagrowth-captions",
  "instagrowth-analysis",
  "instagrowth-calendar",
  "instagrowth-profile",
  "instagrowth-abtest",
] as const;

/**
 * データ管理ダイアログコンポーネント
 * エクスポート・インポート・クリア機能を提供
 */
export function DataManager({ collapsed }: { collapsed: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ストアからデータを取得
  const { captions } = useCaptionStore();
  const { entries: calendarEntries } = useCalendarStore();
  const { posts: analysisPosts, results: analysisResults } = useAnalysisStore();
  const { checkItems: profileItems } = useProfileStore();
  const { tests: abtests } = useABTestStore();
  const { scripts: reelScripts } = useReelStore();

  // 全データをJSON一括エクスポート（構造化データ）
  const handleExportAll = useCallback(() => {
    const hasData =
      captions.length > 0 ||
      calendarEntries.length > 0 ||
      analysisPosts.length > 0 ||
      abtests.length > 0 ||
      reelScripts.length > 0;

    if (!hasData) {
      toast.warning("エクスポートするデータがありません");
      return;
    }

    try {
      exportAllData({
        captions,
        calendar: calendarEntries,
        analysis: { posts: analysisPosts, results: analysisResults },
        profile: profileItems,
        abtests,
        reels: reelScripts,
      });
      toast.success("エクスポートしました");
    } catch {
      toast.error("エクスポートに失敗しました");
    }
  }, [captions, calendarEntries, analysisPosts, analysisResults, profileItems, abtests, reelScripts]);

  // キャプション履歴をCSVエクスポート
  const handleExportCaptionsCSV = useCallback(() => {
    if (captions.length === 0) {
      toast.warning("エクスポートするキャプションがありません");
      return;
    }
    try {
      const csvData = captionsToCSVData(captions);
      const timestamp = new Date().toISOString().slice(0, 10);
      exportAsCSV(csvData, `instagrowth-captions-${timestamp}`);
      toast.success("エクスポートしました");
    } catch {
      toast.error("エクスポートに失敗しました");
    }
  }, [captions]);

  // カレンダーをCSVエクスポート
  const handleExportCalendarCSV = useCallback(() => {
    if (calendarEntries.length === 0) {
      toast.warning("エクスポートするカレンダーデータがありません");
      return;
    }
    try {
      const csvData = calendarToCSVData(calendarEntries);
      const timestamp = new Date().toISOString().slice(0, 10);
      exportAsCSV(csvData, `instagrowth-calendar-${timestamp}`);
      toast.success("エクスポートしました");
    } catch {
      toast.error("エクスポートに失敗しました");
    }
  }, [calendarEntries]);

  // 全ストアデータをエクスポート（localStorage直接バックアップ - 既存機能）
  const handleExport = useCallback(() => {
    try {
      const exportData: Record<string, unknown> = {};

      for (const key of STORE_KEYS) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            exportData[key] = JSON.parse(raw);
          } catch {
            // パース失敗時はスキップ
          }
        }
      }

      // サイドバー状態も含める
      const sidebarState = localStorage.getItem("sidebar-collapsed");
      if (sidebarState) {
        exportData["sidebar-collapsed"] = sidebarState;
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().split("T")[0];
      const a = document.createElement("a");
      a.href = url;
      a.download = `instagrowth-backup-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("データをエクスポートしました");
    } catch {
      toast.error("エクスポートに失敗しました");
    }
  }, []);

  // ファイル選択を開く
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // ファイル読み込み
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        try {
          // JSONとして有効か検証
          const parsed = JSON.parse(content);
          if (typeof parsed !== "object" || parsed === null) {
            toast.error("無効なデータ形式です");
            return;
          }

          // ストアキーが含まれているか確認
          const hasValidKeys = STORE_KEYS.some((key) => key in parsed);
          if (!hasValidKeys) {
            toast.error("InstaGrowthのバックアップデータではありません");
            return;
          }

          // 確認ダイアログを表示
          setPendingImportData(content);
          setShowImportConfirm(true);
        } catch {
          toast.error("JSONファイルの読み込みに失敗しました");
        }
      };
      reader.readAsText(file);

      // 同じファイルを再度選択できるようにリセット
      e.target.value = "";
    },
    []
  );

  // インポート実行
  const confirmImport = useCallback(() => {
    if (!pendingImportData) return;

    try {
      const parsed = JSON.parse(pendingImportData);

      for (const key of STORE_KEYS) {
        if (key in parsed) {
          localStorage.setItem(key, JSON.stringify(parsed[key]));
        }
      }

      // サイドバー状態の復元
      if ("sidebar-collapsed" in parsed) {
        localStorage.setItem("sidebar-collapsed", parsed["sidebar-collapsed"]);
      }

      toast.success("データを復元しました");
      setShowImportConfirm(false);
      setPendingImportData(null);
      setIsOpen(false);

      // ページリロードでストアを反映
      window.location.reload();
    } catch {
      toast.error("データの復元に失敗しました");
    }
  }, [pendingImportData]);

  // 全データクリア
  const handleClear = useCallback(() => {
    try {
      for (const key of STORE_KEYS) {
        localStorage.removeItem(key);
      }

      toast.success("全データをクリアしました");
      setShowClearConfirm(false);
      setIsOpen(false);

      // ページリロードでストアをリセット
      window.location.reload();
    } catch {
      toast.error("データのクリアに失敗しました");
    }
  }, []);

  return (
    <>
      {/* 非表示のファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* メインダイアログ */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
              "text-muted-foreground transition-all duration-200",
              "hover:bg-white/5 hover:text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "border-l-2 border-transparent",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "データ管理" : undefined}
            aria-label="データ管理を開く"
          >
            <Database
              className="h-5 w-5 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-white"
            />
            {!collapsed && (
              <span className="truncate text-sm font-medium">データ管理</span>
            )}
          </button>
        </DialogTrigger>

        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Database className="size-5 text-purple-400" aria-hidden="true" />
              データ管理
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              バックアップの作成・復元、データのクリアができます
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* バックアップ（localStorage直接） */}
            <Button
              variant="outline"
              onClick={handleExport}
              className="w-full justify-start gap-3 border-border bg-muted/50 text-foreground hover:bg-muted hover:text-foreground h-12"
            >
              <Download className="size-4 text-emerald-400" aria-hidden="true" />
              <div className="text-left">
                <span className="block text-sm font-medium">バックアップ</span>
                <span className="block text-[11px] text-muted-foreground">
                  全データをJSONファイルに保存（復元用）
                </span>
              </div>
            </Button>

            <Separator className="bg-border/50" />

            {/* エクスポートセクション */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground px-1">
                エクスポート
              </p>

              {/* 全データJSON */}
              <Button
                variant="outline"
                onClick={handleExportAll}
                className="w-full justify-start gap-3 border-border bg-muted/50 text-foreground hover:bg-muted hover:text-foreground h-12"
              >
                <Download className="size-4 text-purple-400" aria-hidden="true" />
                <div className="text-left">
                  <span className="block text-sm font-medium">
                    全データバックアップ (JSON)
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    全データを構造化JSONで保存
                  </span>
                </div>
              </Button>

              {/* キャプションCSV */}
              <Button
                variant="outline"
                onClick={handleExportCaptionsCSV}
                className="w-full justify-start gap-3 border-border bg-muted/50 text-foreground hover:bg-muted hover:text-foreground h-12"
              >
                <FileSpreadsheet className="size-4 text-emerald-400" aria-hidden="true" />
                <div className="text-left">
                  <span className="block text-sm font-medium">
                    キャプション履歴 (CSV)
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    キャプションをCSVファイルに保存
                  </span>
                </div>
              </Button>

              {/* カレンダーCSV */}
              <Button
                variant="outline"
                onClick={handleExportCalendarCSV}
                className="w-full justify-start gap-3 border-border bg-muted/50 text-foreground hover:bg-muted hover:text-foreground h-12"
              >
                <FileSpreadsheet className="size-4 text-sky-400" aria-hidden="true" />
                <div className="text-left">
                  <span className="block text-sm font-medium">
                    カレンダー (CSV)
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    カレンダーデータをCSVファイルに保存
                  </span>
                </div>
              </Button>
            </div>

            <Separator className="bg-border/50" />

            {/* インポート */}
            <Button
              variant="outline"
              onClick={handleImportClick}
              className="w-full justify-start gap-3 border-border bg-muted/50 text-foreground hover:bg-muted hover:text-foreground h-12"
            >
              <Upload className="size-4 text-blue-400" aria-hidden="true" />
              <div className="text-left">
                <span className="block text-sm font-medium">インポート</span>
                <span className="block text-[11px] text-muted-foreground">
                  JSONファイルからデータを復元
                </span>
              </div>
            </Button>

            {/* データクリア */}
            <Button
              variant="outline"
              onClick={() => setShowClearConfirm(true)}
              className="w-full justify-start gap-3 border-border bg-muted/50 text-foreground hover:bg-red-100 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-300 hover:border-red-300 dark:hover:border-red-800/50 h-12"
            >
              <Trash2 className="size-4 text-red-400" aria-hidden="true" />
              <div className="text-left">
                <span className="block text-sm font-medium">データクリア</span>
                <span className="block text-[11px] text-muted-foreground">
                  全てのデータを削除
                </span>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* インポート確認ダイアログ */}
      <Dialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <DialogContent className="bg-card border-border sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="size-5 text-yellow-400" aria-hidden="true" />
              データの上書き確認
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              現在のデータがバックアップの内容で上書きされます。この操作は元に戻せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="border-border text-muted-foreground"
              >
                キャンセル
              </Button>
            </DialogClose>
            <Button
              onClick={confirmImport}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            >
              復元する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* クリア確認ダイアログ */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="bg-card border-border sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="size-5 text-red-400" aria-hidden="true" />
              全データの削除確認
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              全てのキャプション履歴、分析データ、カレンダー、プロフィール、A/Bテストデータが削除されます。この操作は元に戻せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="border-border text-muted-foreground"
              >
                キャンセル
              </Button>
            </DialogClose>
            <Button
              onClick={handleClear}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              全て削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
