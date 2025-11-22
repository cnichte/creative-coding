const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { loadSettings, saveSettings, ensureWorkspace, SETTINGS_FILE } = require("./main-helpers");

const DEFAULT_PLAYGROUND =
  path.join(__dirname, "..", "..", "001-bit", "dist", "develop", "index.html");
const DEFAULT_SETTINGS = require("./settings-default.json");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));

  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Open",
          click: () => win.webContents.send("menu-open"),
        },
        {
          label: "Save",
          click: () => win.webContents.send("menu-save"),
        },
        {
          label: "Save As",
          click: () => win.webContents.send("menu-save-as"),
        },
      ],
    },
    {
      label: "Debug",
      submenu: [
        {
          label: "Toggle Debug Panel",
          click: () => win.webContents.send("menu-toggle-debug"),
        },
        {
          label: "Toggle DevTools",
          accelerator: "CmdOrCtrl+Alt+I",
          click: () => win.webContents.toggleDevTools(),
        },
      ],
    },
  ];
  const { Menu } = require("electron");
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

ipcMain.handle("getProjectPath", () => {
  return process.cwd();
});

ipcMain.handle("chooseFile", async (_event, filters) => {
  const res = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters,
  });
  return res.canceled ? null : res.filePaths[0];
});

ipcMain.handle("readFile", async (_event, filePath) => {
  return fs.readFileSync(filePath, "utf-8");
});

ipcMain.handle("writeFile", async (_event, filePath, content) => {
  fs.writeFileSync(filePath, content, "utf-8");
  return true;
});

ipcMain.on("inspect-at", (event, x, y) => {
  const wc = event.sender;
  try {
    wc.inspectElement(x, y);
    if (!wc.isDevToolsOpened()) {
      wc.openDevTools({ mode: "detach" });
    }
  } catch (err) {
    console.error("inspect-at failed", err);
  }
});

app.whenReady().then(() => {
  // Ensure workspace/logs exists on startup
  try {
    const settings = loadSettings();
    ensureWorkspace(settings);
  } catch (err) {
    console.error("ensureWorkspace on startup failed", err);
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("getSettings", async () => {
  return loadSettings();
});

ipcMain.handle("saveSettings", async (_event, payload) => {
  const ok = saveSettings(payload);
  if (ok) {
    try {
      ensureWorkspace(payload);
    } catch (err) {
      console.error("ensureWorkspace after save failed", err);
    }
  }
  return ok;
});

ipcMain.handle("writeLog", async (_event, payload) => {
  try {
    const settings = loadSettings();
    const { logDir } = ensureWorkspace(settings);
    const msg = typeof payload === "string" ? payload : JSON.stringify(payload);
    fs.appendFileSync(path.join(logDir, "studio.log"), `[${new Date().toISOString()}] ${msg}\n`, "utf-8");
    return true;
  } catch (err) {
    console.error("writeLog failed", err);
    return false;
  }
});
