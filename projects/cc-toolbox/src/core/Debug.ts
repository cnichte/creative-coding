/**
 * Simple debug helper keeping flat flags under `parameter.debug`.
 * Can also be used globally without parameter: Debug.enable("foo.bar")
 */

// projects/cc-toolbox/src/core/Debug.ts
export class Debug {
  // Menge aller aktivierten Debug-Keys
  static enabledKeys = new Set();
  private static panelContent = new Map<string, string>();
  private static movedHosts = new WeakMap<HTMLElement, { parent: Node; nextSibling: Node | null }>();

  /**
   * Einzelnen Key aktivieren
   * Debug.enable("key.x.y.z")
   */
  static enable(key: string) {
    if (typeof key === "string" && key.trim() !== "") {
      this.enabledKeys.add(key.trim());
    }
  }

  /**
   * Key deaktivieren
   */
  static disable(key: string) {
    this.enabledKeys.delete(key);
  }

  /**
   * Alle Keys auf einmal setzen
   * Debug.setEnabledKeys(["key.a", "key.b.c"])
   */
  static setEnabledKeys(keys: string[]) {
    this.enabledKeys.clear();
    for (const k of keys) {
      this.enable(k);
    }
  }

  /**
   * Optional: aus Komma-getrennter String-Liste initialisieren
   * Debug.initFromString("key.a, key.b.c")
   */
  static initFromString(str: string) {
    if (!str) return;
    const parts = str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    this.setEnabledKeys(parts);
  }

  /**
   * Prüfen, ob ein Key aktiviert ist
   */
  static isEnabled(key: string) {
    return this.enabledKeys.has(key);
  }

  /**
   * Alias: Debug.enabled("key.x.y.z")
   */
  static enabled(key: string) {
    return this.isEnabled(key);
  }

  /**
   * Kleiner Helfer: nur loggen, wenn Key aktiv ist
   */
  static log(key: string, ...args: string[]) {
    if (this.isEnabled(key)) {
      // Prefix mit dem Key (kannst du anpassen)
      console.log(`[${key}]`, ...args);
    }
  }

  /**
   * Kleines Hilfs-Panel unterhalb des Canvas (oder im Body) rendern.
   * content wird als Text gesetzt.
   */
  static renderPanel(
    parameter: any,
    content: string,
    panelId = "cc-debug",
    tabName: string | null = null,
    includeArtworkTab: boolean = true
  ) {
    if (
      !this.isEnabled(panelId) &&
      !this.isEnabled("debug.panel") &&
      !this.isEnabled("io.panel")
    )
      return;
    if (typeof document === "undefined") return;

    const parentId = parameter?.artwork?.canvas?.html?.parent_container_id;
    const parent =
      (parentId && document.getElementById(parentId)) || document.body;
    const parentDefaultDisplay =
      (parent as HTMLElement).style.display || "";
    const host =
      (parent && parent.parentElement) instanceof HTMLElement
        ? (parent.parentElement as HTMLElement)
        : document.body;

    // optional tabbed container
    const tabContainerId = "cc-debug-tabs";
    let container =
      (tabName && document.getElementById(tabContainerId)) || null;
    if (tabName && !container) {
      container = document.createElement("div");
      container.id = tabContainerId;
      container.style.background = "rgba(0,0,0,0.85)";
      container.style.color = "#0f0";
      container.style.padding = "4px";
      container.style.margin = "8px 0 0 0";
      container.style.fontSize = "11px";
      container.style.border = "1px solid #333";
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "0";
      container.style.right = "auto";
      container.style.maxWidth = "640px";
      container.style.width = "100%";
      container.style.zIndex = "1000";

      // tabs header
      const tabs = document.createElement("div");
      tabs.id = `${tabContainerId}-tabs`;
      tabs.style.display = "flex";
      tabs.style.gap = "4px";
      tabs.style.marginBottom = "4px";
      tabs.style.flexWrap = "wrap";
      container.appendChild(tabs);

      // optional Artwork tab toggling parent visibility (move canvas container into tab)
      let artworkPane: HTMLElement | null = null;
      if (includeArtworkTab && parent instanceof HTMLElement) {
        // move canvas container into a pane once
        if (!this.movedHosts.has(parent)) {
          this.movedHosts.set(parent, {
            parent: parent.parentNode as Node,
            nextSibling: parent.nextSibling,
          });
        }
        artworkPane = document.createElement("div");
        artworkPane.id = `${tabContainerId}-artwork`;
        artworkPane.style.display = "block";
        artworkPane.appendChild(parent);
        container.appendChild(artworkPane);

        const btn = document.createElement("button");
        btn.textContent = "Artwork";
        btn.style.background = "#222";
        btn.style.color = "#0f0";
        btn.style.border = "1px solid #333";
        btn.style.padding = "4px 8px";
        btn.style.cursor = "pointer";
        btn.onclick = () => {
          // hide debug panels
          Array.from(
            container?.querySelectorAll("pre") ?? []
          ).forEach((el: any) => {
            el.style.display = "none";
          });
          Array.from(tabs.querySelectorAll("button")).forEach((el: any) => {
            el.style.background = "#222";
          });
          // show artwork pane
          if (artworkPane) artworkPane.style.display = "block";
          btn.style.background = "#444";
        };
        tabs.appendChild(btn);
      }

      host.appendChild(container);
    }

    let panel = document.getElementById(panelId);
    if (!panel) {
      panel = document.createElement("pre");
      panel.id = panelId;
      panel.style.background = "rgba(0,0,0,0.85)";
      panel.style.color = "#0f0";
      panel.style.padding = "8px";
      panel.style.fontSize = "11px";
      panel.style.maxHeight = "220px";
      panel.style.overflow = "auto";
      panel.style.margin = "8px 0 0 0";
      panel.style.position = "relative";
      panel.style.zIndex = "1000";
      panel.style.border = "1px solid #333";
      panel.style.userSelect = "text";
      panel.style.whiteSpace = "pre-wrap";
      panel.style.pointerEvents = "auto";
      panel.style.cursor = "text";
      panel.tabIndex = 0; // allow focus for selection
      if (container) {
        panel.style.margin = "0";
        panel.style.maxHeight = "240px";
        panel.style.display = "none";
        container.appendChild(panel);
        // add tab button
        const tabs = document.getElementById(`${tabContainerId}-tabs`);
        if (tabs) {
          const btn = document.createElement("button");
          btn.textContent = tabName ?? panelId;
          btn.style.background = "#222";
          btn.style.color = "#0f0";
          btn.style.border = "1px solid #333";
          btn.style.padding = "4px 8px";
          btn.style.cursor = "pointer";
          btn.onclick = () => {
            // hide other panels
            Array.from(
              container?.querySelectorAll("pre") ?? []
            ).forEach((el: any) => {
              el.style.display = "none";
            });
            Array.from(tabs.querySelectorAll("button")).forEach((el: any) => {
              el.style.background = "#222";
            });
            panel!.style.display = "block";
            btn.style.background = "#444";
          // hide artwork container while debug tab is active
          const artworkPane = document.getElementById(
            `${tabContainerId}-artwork`
          );
          if (includeArtworkTab && artworkPane) {
            (artworkPane as HTMLElement).style.display = "none";
          }
          };
          tabs.appendChild(btn);
          // activate first tab by default
          if (tabs.children.length === 1) {
            btn.click();
          }
        }
      } else {
        parent.appendChild(panel);
      }
    }

    const last = this.panelContent.get(panelId);
    const isFocused = document.activeElement === panel;
    if (isFocused) return; // don't override while user selects
    if (last === content) return;
    panel.textContent = content;
    this.panelContent.set(panelId, content);
  }
}
