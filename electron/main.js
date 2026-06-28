const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const path = require("path");

const auth = require("./auth");
const store = require("./store");
const { runInstall } = require("./install");
const { launchMinecraft } = require("./launcher");
const { fetchRemoteConfig } = require("./remoteConfig");

let mainWindow;
let runningGameProcess = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 940,
    height: 720,
    minWidth: 760,
    minHeight: 600,
    backgroundColor: "#070c07",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const startUrl = process.env.ELECTRON_START_URL;
  if (startUrl) {
    mainWindow.loadURL(startUrl);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  // ── AUTO-ACTUALIZACIÓN REAL DEL .EXE ─────────────────────────
  // Solo funciona en la app empaquetada (no en "npm run electron:dev")
  // y solo si configuraste "build.publish" en package.json (ver README).
  if (app.isPackaged) {
    try {
      const { autoUpdater } = require("electron-updater");
      autoUpdater.checkForUpdatesAndNotify().catch(() => {});
    } catch (_) {
      /* electron-updater no configurado todavía — se ignora */
    }
  }
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

function send(channel, payload) {
  mainWindow?.webContents.send(channel, payload);
}

// ── ALMACENAMIENTO (reemplaza window.storage del artifact) ────
ipcMain.handle("store:get", (_e, key) => {
  const value = store.get(key);
  return value === null ? null : { key, value };
});
ipcMain.handle("store:set", (_e, key, value) => {
  store.set(key, value);
  return { key, value };
});

// ── LOGIN MICROSOFT (device code flow) ─────────────────────────
ipcMain.handle("auth:login", async () => {
  const device = await auth.requestDeviceCode();
  send("auth:device-code", {
    userCode: device.user_code,
    verificationUri: device.verification_uri,
    expiresIn: device.expires_in, // segundos — Microsoft suele dar 900 (15 min)
  });
  shell.openExternal(device.verification_uri);

  const msToken = await auth.pollDeviceToken(device.device_code, device.interval, device.expires_in);
  const profile = await auth.fullChainFromMsToken(msToken.access_token);

  if (msToken.refresh_token) {
    store.setSecret("ms_refresh_token", msToken.refresh_token);
  }
  store.set("mc_account", profile);
  return profile;
});

ipcMain.handle("auth:try-restore", async () => {
  const refreshToken = store.getSecret("ms_refresh_token");
  if (!refreshToken) return null;
  try {
    const msToken = await auth.refreshMsToken(refreshToken);
    const profile = await auth.fullChainFromMsToken(msToken.access_token);
    if (msToken.refresh_token) store.setSecret("ms_refresh_token", msToken.refresh_token);
    store.set("mc_account", profile);
    return profile;
  } catch (_) {
    return null;
  }
});

ipcMain.handle("auth:logout", async () => {
  store.delete("mc_account");
  store.delete("ms_refresh_token");
  return true;
});

// ── INSTALACIÓN REAL ────────────────────────────────────────────
ipcMain.handle("install:run", async (_e, { mods, mcVersion }) => {
  return runInstall({
    mods,
    mcVersion,
    onProgress: (p) => send("install:progress", p),
  });
});

// ── LANZAR MINECRAFT REAL ───────────────────────────────────────
ipcMain.handle("play:launch", async (_e, { mcVersion, account, settings, serverIp, serverPort }) => {
  if (runningGameProcess) {
    throw new Error("Minecraft ya está en ejecución.");
  }
  const child = await launchMinecraft({
    mcVersion,
    account,
    settings,
    serverIp,
    serverPort,
    onProgress: (p) => send("play:progress", p),
  });

  runningGameProcess = child;
  child.stdout?.on("data", (d) => send("play:log", d.toString()));
  child.stderr?.on("data", (d) => send("play:log", d.toString()));
  child.on("exit", (code) => {
    runningGameProcess = null;
    send("play:exit", { code });
  });

  return { started: true };
});

ipcMain.handle("play:kill", async () => {
  if (runningGameProcess) {
    runningGameProcess.kill();
    runningGameProcess = null;
  }
  return true;
});

// ── SELECCIONAR CARPETA DE INSTALACIÓN (diálogo real) ──────────
ipcMain.handle("system:select-directory", async () => {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ["openDirectory", "createDirectory"] });
  if (result.canceled || !result.filePaths.length) return null;
  return result.filePaths[0];
});

// ── CONFIG REMOTA (mods/changelog/versión sin recompilar) ──────
ipcMain.handle("config:get-remote", (_e, url) => fetchRemoteConfig(url));
