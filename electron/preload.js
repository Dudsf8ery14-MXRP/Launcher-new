const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mxrp", {
  store: {
    get: (key) => ipcRenderer.invoke("store:get", key),
    set: (key, value) => ipcRenderer.invoke("store:set", key, value),
  },
  auth: {
    login: () => ipcRenderer.invoke("auth:login"),
    tryRestore: () => ipcRenderer.invoke("auth:try-restore"),
    logout: () => ipcRenderer.invoke("auth:logout"),
    onDeviceCode: (cb) => {
      const handler = (_e, data) => cb(data);
      ipcRenderer.on("auth:device-code", handler);
      return () => ipcRenderer.removeListener("auth:device-code", handler);
    },
  },
  install: {
    run: (opts) => ipcRenderer.invoke("install:run", opts),
    onProgress: (cb) => {
      const handler = (_e, data) => cb(data);
      ipcRenderer.on("install:progress", handler);
      return () => ipcRenderer.removeListener("install:progress", handler);
    },
  },
  play: {
    launch: (opts) => ipcRenderer.invoke("play:launch", opts),
    kill: () => ipcRenderer.invoke("play:kill"),
    onProgress: (cb) => {
      const handler = (_e, data) => cb(data);
      ipcRenderer.on("play:progress", handler);
      return () => ipcRenderer.removeListener("play:progress", handler);
    },
    onLog: (cb) => {
      const handler = (_e, data) => cb(data);
      ipcRenderer.on("play:log", handler);
      return () => ipcRenderer.removeListener("play:log", handler);
    },
    onExit: (cb) => {
      const handler = (_e, data) => cb(data);
      ipcRenderer.on("play:exit", handler);
      return () => ipcRenderer.removeListener("play:exit", handler);
    },
  },
  system: {
    selectDirectory: () => ipcRenderer.invoke("system:select-directory"),
  },
  config: {
    getRemote: (url) => ipcRenderer.invoke("config:get-remote", url),
  },
});
