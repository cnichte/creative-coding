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

const PLAYGROUND_URL = "http://localhost:8080/";

type DumpMessage = {
  type: "parameter-dump";
  payload: any;
};

type DebugLine = string;

type LeftTabKey = "artwork";
type RightTabKey = "props" | "node" | "debug";

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

  useEffect(() => {
    const listener = (event: MessageEvent<DumpMessage>) => {
      if (event.data?.type === "parameter-dump") {
        setParameterState(event.data.payload);
        setDebugLines((prev) => [JSON.stringify(event.data.payload, null, 2), ...prev].slice(0, 50));
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
        <div className="text-xs text-slate-400 truncate max-w-xs">{projectPath}</div>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" size="sm" onClick={openFile}>
            Open
          </Button>
          <Button variant="secondary" size="sm" onClick={saveFile}>
            Save
          </Button>
        </div>
      </div>

      <PanelGroup direction="horizontal" className="flex-1 min-h-0 px-3 pb-3">
        <Panel defaultSize={55} minSize={25} className="mr-2">
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
                <iframe ref={frameRef} className="w-full h-full border-0" src={PLAYGROUND_URL} />
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </Panel>
        <Handle />
        <Panel defaultSize={45} minSize={25}>
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
                <div className="w-full h-full rounded border border-slate-700 overflow-hidden bg-slate-900/60 flex flex-1 min-h-0">
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
                    <pre
                      ref={debugRef}
                      className="text-xs whitespace-pre-wrap p-3 h-full overflow-auto font-mono"
                    >
{debugView}
                    </pre>
                  </ScrollArea>
                </div>
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </Panel>
      </PanelGroup>
      <div className="h-8 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 flex items-center px-3">
        Status: Ready
      </div>
    </div>
  );
}

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
