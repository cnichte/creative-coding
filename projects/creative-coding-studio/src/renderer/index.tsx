import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "./utils";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PanelGroup, Panel, Handle } from "./ui/resizable";
import { NodeEditor } from "./ui/node-editor";
import { SettingsDialog } from "./components/SettingsDialog";
import type { StudioSettings } from "./settings";
import { ToastOverlay, useToasts } from "./components/Toast";

const PLAYGROUND_URL = "http://localhost:8080/";
const PLAYGROUND_BUILD = "./dist/develop/index.html";

type DumpMessage = {
  type: "parameter-dump";
  payload: any;
};

type DebugLine = string;

type LeftTabKey = "artwork";
type RightTabKey = "props" | "node" | "debug";
type LibraryItem = { id: string; name: string; category: string; desc: string };
type RemoteComponent = { id: string; name?: string };

function useIPC() {
  const [projectPath, setProjectPath] = useState<string>("");
  useEffect(() => {
    window.ccStudio?.getProjectPath?.().then(setProjectPath).catch(() => {});
  }, []);
  return { projectPath };
}

function App() {
  const { projectPath } = useIPC();
  const [leftTab, setLeftTab] = useState<LeftTabKey>("artwork");
  const [rightTab, setRightTab] = useState<RightTabKey>("props");
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [playgroundSrc, setPlaygroundSrc] = useState<"dev" | "build">("dev");
  const [devUrl, setDevUrl] = useState(PLAYGROUND_URL);
  const [buildUrl, setBuildUrl] = useState(PLAYGROUND_BUILD);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<StudioSettings | null>(null);
  const [remoteComponents, setRemoteComponents] = useState<RemoteComponent[]>([]);
  const workspacePath = settings?.workspace?.trim() || projectPath;
  const { toasts, push } = useToasts();
  const debugRef = useRef<HTMLPreElement | null>(null);
  const [debugLines, setDebugLines] = useState<DebugLine[]>([]);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [parameterState, setParameterState] = useState<any>(null);
  const [paramFilter, setParamFilter] = useState("");
  const [agents] = useState<
    { name: string; visible: boolean; active: boolean; ticks: number; hooks: string[] }[]
  >([
    { name: "Background", visible: true, active: true, ticks: 120, hooks: ["draw"] },
    { name: "Grid Manager", visible: true, active: true, ticks: 120, hooks: ["update", "draw"] },
    { name: "ColorSet", visible: true, active: true, ticks: 60, hooks: ["animate_slow"] },
    { name: "Custom Agent", visible: false, active: false, ticks: 0, hooks: [] },
  ]);
  const [timelinePos, setTimelinePos] = useState(0);
  const [timelineItems] = useState<{ id: string; from: number; to: number; loop?: boolean }[]>([
    { id: "flash-bg", from: 0, to: 5, loop: true },
    { id: "move-grid", from: 2, to: 10 },
  ]);
  const componentLibrary = useMemo<LibraryItem[]>(
    () => [
      { id: "background", name: "Background", category: "Canvas", desc: "Füllt den Hintergrund" },
      { id: "grid", name: "Grid Manager", category: "Layout", desc: "Raster/Entities" },
      { id: "colorset", name: "ColorSet", category: "Palette", desc: "Paletten/Animation" },
      { id: "particle", name: "Particles", category: "Agents", desc: "Partikelsystem" },
      { id: "sensor", name: "Sensor Input", category: "IO", desc: "Externe Datenquelle" },
      { id: "timeline", name: "Timeline Item", category: "Animation", desc: "Zeitgesteuertes Event" },
    ],
    []
  );

  useEffect(() => {
    const listener = (event: MessageEvent<DumpMessage>) => {
      if (event.data?.type === "parameter-dump") {
        setParameterState(event.data.payload);
        setDebugLines((prev) => [JSON.stringify(event.data.payload, null, 2), ...prev].slice(0, 50));
      }
      if ((event.data as any)?.type === "component-added") {
        const d: any = event.data;
        setDebugLines((prev) => [
          `ACK from Artwork: ${d.name || d.id} (${d.status || "ok"})${d.error ? " - " + d.error : ""}`,
          ...prev,
        ].slice(0, 50));
        if (d.status === "ok") {
          push("success", `Added ${d.name || d.id} (${d.total ?? ""})`);
        } else {
          push("error", `Failed ${d.name || d.id}: ${d.error || "unsupported"}`);
        }
        }
      if ((event.data as any)?.type === "artwork-state") {
        const d: any = event.data;
        if (Array.isArray(d.addedComponents)) {
          setRemoteComponents(d.addedComponents);
        }
        setDebugLines((prev) => [`State from Artwork: ${JSON.stringify(d.addedComponents || [])}`, ...prev].slice(0, 50));
      }
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  // Context menu: Inspect element in DevTools
  useEffect(() => {
    const onCtx = (e: MouseEvent) => {
      e.preventDefault();
      window.ccStudio?.inspectAt?.(e.clientX, e.clientY);
    };
    window.addEventListener("contextmenu", onCtx);
    return () => window.removeEventListener("contextmenu", onCtx);
  }, []);

  // load settings once
  useEffect(() => {
    window.ccStudio
      ?.getSettings?.()
      .then((s) => setSettings(s || null))
      .catch(() => {});
  }, []);

  // apply theme
  useEffect(() => {
    if (!settings) return;
    const theme = settings.theme || "dark";
    document.documentElement.dataset.theme = theme;
  }, [settings]);

  const parseDragData = (e: React.DragEvent): LibraryItem | null => {
    const raw = e.dataTransfer.getData("application/json") || e.dataTransfer.getData("text/plain");
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      if (data?.id && data?.name) {
        return data as LibraryItem;
      }
    } catch {
      return null;
    }
    return null;
  };

  const requestDump = () => {
    frameRef.current?.contentWindow?.postMessage({ type: "request-parameter-dump" }, "*");
  };

  const toggleDebugPanel = () => {
    frameRef.current?.contentWindow?.postMessage({ type: "toggle-debug-panel" }, "*");
  };

  const openFile = async () => {
    const file = await window.ccStudio?.chooseFile?.([{ name: "JSON", extensions: ["json"] }]);
    if (!file) return;
    const content = await window.ccStudio?.readFile?.(file);
    setDebugLines((prev) => [`Loaded ${file}\n\n${content}`, ...prev]);
  };

  const saveFile = async () => {
    requestDump();
  };

  const debugView = useMemo(() => debugLines.join("\n\n"), [debugLines]);
  const filteredParamsView = useMemo(() => {
    if (!parameterState) return null;
    if (!paramFilter.trim()) return parameterState;
    // naive filter: only keep entries whose stringified content includes filter
    try {
      const json = JSON.stringify(parameterState, null, 2);
      const lines = json
        .split("\n")
        .filter((l) => l.toLowerCase().includes(paramFilter.toLowerCase()));
      return lines.length ? lines.join("\n") : "Kein Treffer";
    } catch {
      return parameterState;
    }
  }, [parameterState, paramFilter]);

  const renderTree = (value: any, path: string[] = []) => {
    if (value === null || value === undefined) {
      return <span className="text-slate-400">null</span>;
    }
    if (typeof value !== "object") {
      return <span className="text-amber-200">{String(value)}</span>;
    }
    if (Array.isArray(value)) {
      return (
        <div className="pl-3 border-l border-slate-700 space-y-1">
          {value.slice(0, 20).map((v, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-slate-500">[{i}]</span>
              {renderTree(v, [...path, String(i)])}
            </div>
          ))}
          {value.length > 20 && <div className="text-xs text-slate-500">… {value.length - 20} more</div>}
        </div>
      );
    }
    const entries = Object.entries(value).slice(0, 40);
    return (
      <div className="pl-3 border-l border-slate-700 space-y-1">
        {entries.map(([k, v]) => (
          <div key={k} className="flex gap-2 items-start">
            <span className="text-slate-300">{k}:</span>
            <div className="flex-1">{renderTree(v, [...path, k])}</div>
          </div>
        ))}
        {Object.keys(value).length > 40 && (
          <div className="text-xs text-slate-500">… {Object.keys(value).length - 40} more</div>
        )}
      </div>
    );
  };

  return (
    <div className="h-dvh min-h-0 flex flex-col">
      <div className="flex items-center gap-4 p-3 bg-slate-800 border-b border-slate-700">
        <div className="text-lg font-semibold">Creative Coding Studio</div>
        <div className="text-xs text-slate-400 truncate max-w-xs">{workspacePath}</div>
        <div className="ml-auto flex gap-2">
          <div className="hidden sm:flex items-center gap-2 border border-slate-700 rounded px-2 py-1">
            <select
              className="bg-slate-900 text-xs border border-slate-700 rounded px-2 py-1"
              value={playgroundSrc}
              onChange={(e) => setPlaygroundSrc(e.target.value as "dev" | "build")}
            >
              <option value="dev">Dev URL</option>
              <option value="build">Local Build</option>
            </select>
            <input
              className="bg-slate-900 text-xs border border-slate-700 rounded px-2 py-1 w-48"
              value={playgroundSrc === "dev" ? devUrl : buildUrl}
              onChange={(e) =>
                playgroundSrc === "dev" ? setDevUrl(e.target.value) : setBuildUrl(e.target.value)
              }
            />
          </div>
          <Button variant="secondary" size="sm" onClick={() => setSettingsOpen(true)}>
            Settings
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setLibraryOpen((v) => !v)}
            className="hidden sm:inline-flex"
          >
            {libraryOpen ? "Library <<" : "Library >>"}
          </Button>
          <Button variant="secondary" size="sm" onClick={openFile}>
            Open
          </Button>
        <Button variant="secondary" size="sm" onClick={saveFile}>
          Save
        </Button>
      </div>
    </div>

      <div className="flex flex-1 min-h-0 px-3 pb-3 gap-2">
        {libraryOpen && (
          <div className="w-56 min-w-[14rem] bg-slate-900 border border-slate-800 rounded flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
              <div className="text-sm font-semibold text-slate-100">Library</div>
              <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setLibraryOpen(false)}>
                ×
              </Button>
            </div>
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-2 space-y-2">
                {componentLibrary.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={(e) => {
                      const payload = JSON.stringify(c);
                      e.dataTransfer.setData("application/json", payload);
                      e.dataTransfer.setData("text/plain", payload);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    className="rounded border border-slate-700 bg-slate-800/80 p-2 cursor-grab hover:border-emerald-400"
                    title={c.desc}
                  >
                    <div className="text-xs uppercase text-slate-400">{c.category}</div>
                    <div className="text-sm font-semibold text-slate-100">{c.name}</div>
                    <div className="text-[11px] text-slate-400">{c.desc}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <PanelGroup direction="horizontal" className="flex-1 min-h-0">
              <Panel defaultSize={libraryOpen ? 50 : 55} minSize={20} className="mr-2">
                <div className="h-full bg-slate-900 border border-slate-800 rounded overflow-hidden flex flex-col">
                  <Tabs.Root value={leftTab} onValueChange={(v) => setLeftTab(v as LeftTabKey)} className="flex-1 flex flex-col min-h-0">
                    <Tabs.List className="flex gap-2 p-2" aria-label="Left Tabs">
                      <Tabs.Trigger
                        value="artwork"
                        className={cn(
                          "px-3 py-2 rounded border text-sm",
                          leftTab === "artwork"
                            ? "bg-slate-700 border-slate-500"
                            : "bg-slate-800 border-slate-700 hover:border-slate-600"
                        )}
                      >
                        Artwork
                      </Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value="artwork" className="flex-1 min-h-0 flex">
                  <div
                    className="w-full h-full"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const item = parseDragData(e);
                    if (item) {
                      frameRef.current?.contentWindow?.postMessage(
                        { type: "add-component", component: item },
                        "*"
                      );
                      setDebugLines((prev) => [`Drop->Artwork: ${item.name}`, ...prev].slice(0, 50));
                      push("success", `Drop to Artwork: ${item.name}`);
                      window.ccStudio?.writeLog?.(`Drop->Artwork: ${item.id}`);
                    }
                  }}
                >
                    <iframe
                      ref={frameRef}
                      className="w-full h-full border-0"
                      src={playgroundSrc === "dev" ? devUrl : buildUrl}
                    />
                  </div>
                </Tabs.Content>
            </Tabs.Root>
          </div>
            </Panel>
            <Handle />
            <Panel defaultSize={libraryOpen ? 50 : 45} minSize={25}>
              <div className="h-full bg-slate-800 border border-slate-700 rounded p-2 overflow-hidden flex flex-col">
                <Tabs.Root value={rightTab} onValueChange={(v) => setRightTab(v as RightTabKey)} className="flex-1 flex flex-col min-h-0">
              <Tabs.List className="flex gap-2 p-2" aria-label="Right Tabs">
                <Tabs.Trigger
                  value="props"
                  className={cn(
                    "px-3 py-2 rounded border text-sm",
                    rightTab === "props"
                      ? "bg-slate-700 border-slate-500"
                      : "bg-slate-800 border-slate-700 hover:border-slate-600"
                  )}
                >
                  Properties
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="node"
                  className={cn(
                    "px-3 py-2 rounded border text-sm",
                    rightTab === "node"
                      ? "bg-slate-700 border-slate-500"
                      : "bg-slate-800 border-slate-700 hover:border-slate-600"
                  )}
                >
                  Node-Editor
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="debug"
                  className={cn(
                    "px-3 py-2 rounded border text-sm",
                    rightTab === "debug"
                      ? "bg-slate-700 border-slate-500"
                      : "bg-slate-800 border-slate-700 hover:border-slate-600"
                  )}
                >
                  Debug
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content
                value="props"
                className="flex-1 min-h-0 flex flex-col"
                style={{ display: rightTab === "props" ? "flex" : "none" }}
              >
                <ScrollArea className="flex-1 min-h-0 h-full pr-1">
                    <div className="flex-1 min-h-0 flex flex-col gap-2 pb-2">
                      <Card className="bg-slate-800/80 border-slate-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Artwork Components</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {remoteComponents.length === 0 ? (
                            <div className="text-xs text-slate-500">Noch keine Komponenten hinzugefügt.</div>
                          ) : (
                            <ul className="text-xs text-slate-200 space-y-1">
                              {remoteComponents.map((c) => (
                                <li key={`${c.id}-${c.name ?? ""}`} className="flex items-center gap-2">
                                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                                  <div className="flex-1">
                                    <div className="font-semibold">{c.name || c.id}</div>
                                    <div className="text-[11px] text-slate-400">{c.id}</div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-800/80 border-slate-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Parameter Explorer</CardTitle>
                        </CardHeader>
                      <CardContent className="flex flex-col gap-2">
                        <div className="flex gap-2 items-center">
                          <Button size="sm" onClick={requestDump}>
                            Refresh
                          </Button>
                          <Button size="sm" variant="ghost" onClick={toggleDebugPanel}>
                            Debug-Panel im Playground
                          </Button>
                          <input
                            className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs flex-1"
                            placeholder="Search..."
                            value={paramFilter}
                            onChange={(e) => setParamFilter(e.target.value)}
                          />
                        </div>
                        <ScrollArea className="h-48 rounded border border-slate-700/70 bg-slate-900/50 p-2">
                          {parameterState ? (
                            paramFilter.trim() ? (
                              <pre className="text-[11px] text-slate-200 whitespace-pre-wrap">
                                {filteredParamsView as string}
                              </pre>
                            ) : (
                              <div className="text-xs text-slate-200 space-y-1">{renderTree(parameterState)}</div>
                            )
                          ) : (
                            <div className="text-xs text-slate-500">Noch kein Parameter-Dump geladen.</div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/80 border-slate-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Agents (SceneGraph)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-28">
                          <ul className="text-xs text-slate-200 space-y-2">
                            {agents.map((a) => (
                              <li key={a.name} className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "inline-block h-2 w-2 rounded-full",
                                    a.active ? "bg-emerald-400" : "bg-slate-600"
                                  )}
                                />
                                <div className="flex-1">
                                  <div className="font-semibold">{a.name}</div>
                                  <div className="text-[11px] text-slate-400">
                                    {a.visible ? "visible" : "hidden"} · {a.ticks} ticks · Hooks:{" "}
                                    {a.hooks.join(", ") || "-"}
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/80 border-slate-700 flex min-h-0 flex-col">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Timeline</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 min-h-0 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <span className="h-2 w-2 rounded-full bg-amber-400" />
                            Playhead
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              frameRef.current?.contentWindow?.postMessage({ type: "timeline-play-toggle" }, "*")
                            }
                          >
                            Play/Pause
                          </Button>
                        </div>
                        <div className="h-2 w-full rounded bg-slate-700">
                          <div
                            className="h-2 bg-emerald-400 rounded"
                            style={{ width: `${Math.min(Math.max(timelinePos, 0), 100)}%` }}
                          />
                        </div>
                        <ScrollArea className="flex-1 rounded border border-slate-700/70 bg-slate-900/50 p-2">
                          <div className="text-xs text-slate-200 space-y-2">
                            {timelineItems.map((t) => (
                              <div key={t.id} className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold">{t.id}</div>
                                  <div className="text-[11px] text-slate-400">
                                    {t.from}s → {t.to}s {t.loop ? "· loop" : ""}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    frameRef.current?.contentWindow?.postMessage(
                                      { type: "timeline-scrub", position: t.from },
                                      "*"
                                    )
                                  }
                                >
                                  Jump
                                </Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={timelinePos}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setTimelinePos(val);
                              frameRef.current?.contentWindow?.postMessage(
                                { type: "timeline-scrub", position: val / 10 },
                                "*"
                              );
                            }}
                            className="flex-1"
                          />
                          <span className="text-xs text-slate-300 w-10 text-right">{timelinePos}%</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/80 border-slate-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">IO Debug</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-xs text-slate-200">
                          tweakpane → parameter (live), sensors (stub)
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const snapshot = {
                              channel: "tweakpane",
                              last: Date.now(),
                              keys: ["colorset.mode", "format.width", "background.color"],
                            };
                            setDebugLines((prev) => [JSON.stringify(snapshot, null, 2), ...prev].slice(0, 50));
                          }}
                        >
                          Snapshot
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </Tabs.Content>

              <Tabs.Content
                value="node"
                className="flex-1 min-h-0 flex flex-col"
                style={{ display: rightTab === "node" ? "flex" : "none" }}
              >
                <div
                  className="w-full h-full rounded border border-slate-700 overflow-hidden bg-slate-900/60 flex flex-1 min-h-0"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const item = parseDragData(e);
                    if (item) {
                      setDebugLines((prev) => [`Drop->NodeEditor: ${item.name}`, ...prev].slice(0, 50));
                      push("success", `Drop to NodeEditor: ${item.name}`);
                      window.ccStudio?.writeLog?.(`Drop->NodeEditor: ${item.id}`);
                    }
                  }}
                >
                  <NodeEditor className="flex-1 min-h-0 w-full h-full" />
                </div>
              </Tabs.Content>

              <Tabs.Content
                value="debug"
                className="flex-1 min-h-0 flex flex-col"
                style={{ display: rightTab === "debug" ? "flex" : "none" }}
              >
                <div className="flex-1 bg-slate-900/80 border border-slate-700 rounded min-h-0 flex flex-col">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700">
                    <Button size="sm" variant="secondary" onClick={requestDump}>
                      Refresh
                    </Button>
                    <Button size="sm" variant="ghost" onClick={toggleDebugPanel}>
                      Toggle Debug Panel (Playground)
                    </Button>
                  </div>
                  <ScrollArea className="flex-1 min-h-0">
                    <pre ref={debugRef} className="text-xs whitespace-pre-wrap p-3 h-full overflow-auto font-mono">
                      {debugView}
                    </pre>
                  </ScrollArea>
                </div>
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </Panel>
      </PanelGroup>
      </div>
      <div className="h-8 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 flex items-center px-3">
        Status: Ready
      </div>
      <ToastOverlay toasts={toasts} />
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={(s) => {
          setSettings(s);
          window.ccStudio?.saveSettings?.(s);
          setSettingsOpen(false);
        }}
      />
    </div>
  );
}

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
