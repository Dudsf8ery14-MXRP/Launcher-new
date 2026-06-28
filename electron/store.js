// ══════════════════════════════════════════════════════════════
//  ALMACENAMIENTO LOCAL PERSISTENTE
//  Guarda datos en un archivo JSON dentro de la carpeta de datos
//  de la app (userData). Los tokens sensibles se cifran con
//  safeStorage de Electron antes de guardarse en disco.
// ══════════════════════════════════════════════════════════════
const fs = require("fs");
const path = require("path");
const { app, safeStorage } = require("electron");

function filePath() {
  return path.join(app.getPath("userData"), "mxrp-data.json");
}

function readAll() {
  try {
    const raw = fs.readFileSync(filePath(), "utf-8");
    return JSON.parse(raw);
  } catch (_) {
    return {};
  }
}

function writeAll(obj) {
  fs.mkdirSync(path.dirname(filePath()), { recursive: true });
  fs.writeFileSync(filePath(), JSON.stringify(obj, null, 2), "utf-8");
}

function get(key) {
  const all = readAll();
  return Object.prototype.hasOwnProperty.call(all, key) ? all[key] : null;
}

function set(key, value) {
  const all = readAll();
  all[key] = value;
  writeAll(all);
  return true;
}

function del(key) {
  const all = readAll();
  delete all[key];
  writeAll(all);
  return true;
}

// Guarda un secreto (ej. refresh_token) cifrado con la clave del sistema operativo del usuario.
function setSecret(key, plainText) {
  if (safeStorage.isEncryptionAvailable()) {
    const enc = safeStorage.encryptString(plainText);
    set(key, { __encrypted: true, data: enc.toString("base64") });
  } else {
    set(key, { __encrypted: false, data: plainText });
  }
}

function getSecret(key) {
  const stored = get(key);
  if (!stored) return null;
  if (stored.__encrypted) {
    return safeStorage.decryptString(Buffer.from(stored.data, "base64"));
  }
  return stored.data;
}

module.exports = { get, set, delete: del, setSecret, getSecret };
