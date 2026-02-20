"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";
import type { ShortcutDef } from "@/hooks/useKeyboardShortcuts";

/** キーバインドを表示するコンポーネント */
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
      {children}
    </kbd>
  );
}

/** ショートカットのキー表示を生成 */
function ShortcutKeys({ shortcut }: { shortcut: ShortcutDef }) {
  const keys: string[] = [];
  if (shortcut.ctrl) keys.push("Ctrl");
  if (shortcut.shift) keys.push("Shift");
  keys.push(shortcut.key === "/" ? "/" : shortcut.key.toUpperCase());

  return (
    <div className="flex items-center gap-1">
      {keys.map((key, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground">+</span>}
          <Kbd>{key}</Kbd>
        </span>
      ))}
    </div>
  );
}

/** カテゴリのラベルマッピング */
const categoryLabels: Record<string, string> = {
  navigation: "ナビゲーション",
  action: "アクション",
};

/**
 * ショートカット一覧ダイアログコンポーネント
 * - カテゴリ別にグループ化して表示
 * - kbd スタイルでキーバインドを表示
 * - "/" キーで開閉
 */
export function ShortcutHelp({
  open,
  onOpenChange,
  shortcuts,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts: ShortcutDef[];
}) {
  // カテゴリ別にグループ化
  const grouped = shortcuts.reduce(
    (acc, shortcut) => {
      const category = shortcut.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(shortcut);
      return acc;
    },
    {} as Record<string, ShortcutDef[]>
  );

  // カテゴリの表示順序
  const categoryOrder = ["navigation", "action"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Keyboard className="size-5 text-purple-400" aria-hidden="true" />
            キーボードショートカット
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            キーボードショートカットでページを素早く移動できます
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {categoryOrder.map((category) => {
            const items = grouped[category];
            if (!items || items.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                  {categoryLabels[category] || category}
                </h3>
                <div className="space-y-2">
                  {items.map((shortcut, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-muted/50"
                    >
                      <span className="text-sm text-muted-foreground">
                        {shortcut.description}
                      </span>
                      <ShortcutKeys shortcut={shortcut} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
