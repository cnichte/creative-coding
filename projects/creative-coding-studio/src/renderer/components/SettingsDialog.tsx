import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { StudioSettings, defaultSettings } from "../settings";

export function SettingsDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (settings: StudioSettings) => void;
}) {
  const [settings, setSettings] = useState<StudioSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      window.ccStudio
        ?.getSettings?.()
        .then((s) => setSettings(s || defaultSettings))
        .catch((err) => setError(String(err)))
        .finally(() => setLoading(false));
    }
  }, [open]);

  const save = async () => {
    setLoading(true);
    setError(null);
    try {
      const ok = await window.ccStudio?.saveSettings?.(settings);
      if (ok) onSave(settings);
    } catch (err: any) {
      setError(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded shadow-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Settings</div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            ×
          </Button>
        </div>
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4 p-1">
            <div className="space-y-2">
              <div className="text-sm text-slate-200">Theme</div>
              <select
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value as StudioSettings["theme"] })}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-slate-200">Workspace</div>
              <input
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm w-full"
                value={settings.workspace}
                onChange={(e) => setSettings({ ...settings, workspace: e.target.value })}
                placeholder="/Users/<user>/creative-coding-studio"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={settings.logsEnabled}
                  onChange={(e) => setSettings({ ...settings, logsEnabled: e.target.checked })}
                />
                Logs schreiben (workspace/logs)
              </label>
            </div>
          </div>
        </ScrollArea>

        {error && <div className="text-xs text-amber-400">{error}</div>}

        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onClose}>
            Abbrechen
          </Button>
          <Button size="sm" variant="secondary" onClick={save} disabled={loading}>
            {loading ? "Speichern…" : "Speichern"}
          </Button>
        </div>
      </div>
    </div>
  );
}
