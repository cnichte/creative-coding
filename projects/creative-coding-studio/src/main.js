const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

const DEFAULT_PLAYGROUND =
  path.join(__dirname, "..", "..", "001-bit", "dist", "develop", "index.html");

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
