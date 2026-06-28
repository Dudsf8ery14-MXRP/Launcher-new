// ══════════════════════════════════════════════════════════════
//  DESCARGA E INSTALACIÓN DE JAVA 17 (OpenJDK / Adoptium)
// ══════════════════════════════════════════════════════════════
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const { app } = require("electron");
const extractZip = require("extract-zip");
const tar = require("tar");

function getPlatformArchKey() {
  const platform =
    process.platform === "win32" ? "windows" : process.platform === "darwin" ? "mac" : "linux";
  const arch = process.arch === "x64" ? "x64" : process.arch === "arm64" ? "aarch64" : process.arch;
  return { platform, arch };
}

// Descarga genérica con progreso, reusada por los otros instaladores.
async function downloadFile(url, destPath, onProgress) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Error descargando ${url}: HTTP ${res.status}`);
  const total = Number(res.headers.get("content-length")) || 0;
  let received = 0;
  await fsp.mkdir(path.dirname(destPath), { recursive: true });
  const fileStream = fs.createWriteStream(destPath);
  for await (const chunk of res.body) {
    fileStream.write(chunk);
    received += chunk.length;
    if (onProgress && total) onProgress(received / total);
  }
  await new Promise((resolve, reject) => fileStream.end((err) => (err ? reject(err) : resolve())));
}

function findJavaBinary(runtimeDir) {
  const entries = fs.readdirSync(runtimeDir).filter((e) => {
    try {
      return fs.statSync(path.join(runtimeDir, e)).isDirectory();
    } catch (_) {
      return false;
    }
  });
  if (!entries.length) throw new Error("No se encontró la carpeta extraída de Java 17.");
  const base = path.join(runtimeDir, entries[0]);
  if (process.platform === "win32") return path.join(base, "bin", "javaw.exe");
  if (process.platform === "darwin") return path.join(base, "Contents", "Home", "bin", "java");
  return path.join(base, "bin", "java");
}

// Descarga e instala Java 17 (JRE) si no está ya instalado. Devuelve la ruta al ejecutable java/javaw.
async function ensureJava17(onProgress) {
  const runtimeDir = path.join(app.getPath("userData"), "runtime", "jdk17");
  const markerFile = path.join(runtimeDir, ".installed");

  if (fs.existsSync(markerFile)) {
    return findJavaBinary(runtimeDir);
  }

  await fsp.mkdir(runtimeDir, { recursive: true });
  const { platform, arch } = getPlatformArchKey();

  // API de Adoptium (Eclipse Temurin): https://api.adoptium.net
  const apiUrl = `https://api.adoptium.net/v3/binary/latest/17/ga/${platform}/${arch}/jre/hotspot/normal/eclipse`;

  const archivePath = path.join(runtimeDir, platform === "windows" ? "jdk.zip" : "jdk.tar.gz");

  onProgress?.({ label: "Descargando Java 17 (Eclipse Temurin)...", pct: 0 });
  await downloadFile(apiUrl, archivePath, (p) =>
    onProgress?.({ label: "Descargando Java 17...", pct: p * 100 })
  );

  onProgress?.({ label: "Extrayendo Java 17...", pct: 0 });
  if (platform === "windows") {
    await extractZip(archivePath, { dir: runtimeDir });
  } else {
    await tar.x({ file: archivePath, cwd: runtimeDir });
  }
  await fsp.unlink(archivePath);
  await fsp.writeFile(markerFile, "ok");

  onProgress?.({ label: "Java 17 instalado", pct: 100 });
  return findJavaBinary(runtimeDir);
}

module.exports = { ensureJava17, downloadFile, getPlatformArchKey };
