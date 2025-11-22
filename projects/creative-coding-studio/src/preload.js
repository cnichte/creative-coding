const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ccStudio", {
  getProjectPath: () => ipcRenderer.invoke("getProjectPath"),
  chooseFile: (filters) => ipcRenderer.invoke("chooseFile", filters),
  readFile: (filePath) => ipcRenderer.invoke("readFile", filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke("writeFile", filePath, content),
  inspectAt: (x, y) => ipcRenderer.send("inspect-at", x, y),
  onMenu: (channel, handler) => {
    const valid = ["menu-open", "menu-save", "menu-save-as", "menu-toggle-debug"];
    if (valid.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => handler(...args));
    }
  },
});
