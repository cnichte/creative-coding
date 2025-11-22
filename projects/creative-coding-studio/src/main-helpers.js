const path = require("path");
const fs = require("fs");
const os = require("os");
const DEFAULT_SETTINGS = require("./settings-default.json");
const SETTINGS_FILE = path.join(os.homedir(), ".creative-coding-studio", "settings.json");

function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("getSettings failed", err);
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(payload) {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(payload, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("saveSettings failed", err);
    return false;
  }
}

function ensureWorkspace(settings) {
  const workspace = settings.workspace && settings.workspace.trim()
    ? settings.workspace.trim()
    : path.join(os.homedir(), "creative-coding-studio");
  const logDir = path.join(workspace, "logs");
  try {
    fs.mkdirSync(logDir, { recursive: true });
  } catch (err) {
    console.error("ensureWorkspace failed", err);
  }
  return { workspace, logDir };
}

module.exports = {
  SETTINGS_FILE,
  loadSettings,
  saveSettings,
  ensureWorkspace,
};
