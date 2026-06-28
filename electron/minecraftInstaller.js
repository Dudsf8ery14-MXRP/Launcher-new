// ══════════════════════════════════════════════════════════════
//  DESCARGA DE MINECRAFT (oficial, vía API pública de Mojang)
//  + INSTALACIÓN DE FABRIC LOADER (vía meta.fabricmc.net)
// ══════════════════════════════════════════════════════════════
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const { app } = require("electron");
const extractZip = require("extract-zip");
const { downloadFile } = require("./javaInstaller");

function MC_DIR() {
  return path.join(app.getPath("userData"), "minecraft");
}

function osNameMatches(name) {
  const map = { windows: "win32", osx: "darwin", linux: "linux" };
  return map[name] === process.platform;
}

// Evalúa el array "rules" que usa el formato de versión de Mojang/Fabric
function rulesAllow(rules) {
  if (!rules) return true;
  let allowed = false;
  for (const rule of rules) {
    let osOk = true;
    if (rule.os?.name) osOk = osNameMatches(rule.os.name);
    if (osOk) allowed = rule.action === "allow";
  }
  return allowed;
}

function libraryAllowed(lib) {
  return rulesAllow(lib.rules);
}

// ── Manifiesto oficial de versiones de Minecraft ──────────────
async function getVersionJson(mcVersion) {
  const res = await fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json");
  const manifest = await res.json();
  const entry = manifest.versions.find((v) => v.id === mcVersion);
  if (!entry) throw new Error(`Versión de Minecraft ${mcVersion} no encontrada en el manifiesto oficial.`);
  const r2 = await fetch(entry.url);
  return r2.json();
}

// ── Cliente vanilla (.jar) ─────────────────────────────────────
async function ensureMinecraftClient(mcVersion, onProgress) {
  const versionJson = await getVersionJson(mcVersion);
  const dir = path.join(MC_DIR(), "versions", mcVersion);
  await fsp.mkdir(dir, { recursive: true });
  const jarPath = path.join(dir, `${mcVersion}.jar`);

  if (!fs.existsSync(jarPath)) {
    onProgress?.({ label: `Descargando Minecraft ${mcVersion}...`, pct: 0 });
    await downloadFile(versionJson.downloads.client.url, jarPath, (p) =>
      onProgress?.({ label: `Descargando Minecraft ${mcVersion}...`, pct: p * 100 })
    );
  }
  await fsp.writeFile(path.join(dir, `${mcVersion}.json`), JSON.stringify(versionJson));
  return { versionJson, jarPath };
}

// ── Librerías vanilla + extracción de natives (LWJGL, etc.) ───
async function ensureLibrariesAndNatives(versionJson, onProgress) {
  const libsDir = path.join(MC_DIR(), "libraries");
  const nativesDir = path.join(MC_DIR(), "versions", versionJson.id, "natives");
  await fsp.mkdir(nativesDir, { recursive: true });

  const classpath = [];
  const libs = versionJson.libraries.filter(libraryAllowed);
  let i = 0;

  const classifierKey = {
    win32: "natives-windows",
    darwin: "natives-macos",
    linux: "natives-linux",
  }[process.platform];

  for (const lib of libs) {
    i++;
    onProgress?.({ label: `Librerías de Minecraft (${i}/${libs.length})`, pct: (i / libs.length) * 100 });

    if (lib.downloads?.artifact) {
      const art = lib.downloads.artifact;
      const dest = path.join(libsDir, art.path);
      if (!fs.existsSync(dest)) {
        await fsp.mkdir(path.dirname(dest), { recursive: true });
        await downloadFile(art.url, dest);
      }
      classpath.push(dest);
    }

    const classifierArt = lib.downloads?.classifiers?.[classifierKey];
    if (classifierArt) {
      const dest = path.join(libsDir, classifierArt.path);
      if (!fs.existsSync(dest)) {
        await fsp.mkdir(path.dirname(dest), { recursive: true });
        await downloadFile(classifierArt.url, dest);
      }
      try {
        await extractZip(dest, { dir: nativesDir });
      } catch (_) {
        /* algunos jars de natives no son zips válidos en ciertas plataformas; se ignora */
      }
    }
  }
  return { classpath, nativesDir };
}

// ── Assets (texturas, sonidos, idiomas) ────────────────────────
async function ensureAssets(versionJson, onProgress) {
  const res = await fetch(versionJson.assetIndex.url);
  const assetIndex = await res.json();

  const assetsDir = path.join(MC_DIR(), "assets");
  const objectsDir = path.join(assetsDir, "objects");
  const indexesDir = path.join(assetsDir, "indexes");
  await fsp.mkdir(objectsDir, { recursive: true });
  await fsp.mkdir(indexesDir, { recursive: true });
  await fsp.writeFile(
    path.join(indexesDir, `${versionJson.assetIndex.id}.json`),
    JSON.stringify(assetIndex)
  );

  const entries = Object.entries(assetIndex.objects);
  let i = 0;
  for (const [, obj] of entries) {
    i++;
    const sub = obj.hash.substring(0, 2);
    const dest = path.join(objectsDir, sub, obj.hash);
    if (!fs.existsSync(dest)) {
      const url = `https://resources.download.minecraft.net/${sub}/${obj.hash}`;
      await downloadFile(url, dest);
    }
    if (i % 20 === 0 || i === entries.length) {
      onProgress?.({ label: `Assets (${i}/${entries.length})`, pct: (i / entries.length) * 100 });
    }
  }
  return { assetsDir, assetIndexId: versionJson.assetIndex.id };
}

// ── Fabric Loader (perfil + librerías) ─────────────────────────
async function ensureFabric(mcVersion, onProgress) {
  onProgress?.({ label: "Resolviendo versión de Fabric Loader...", pct: 0 });
  const loadersRes = await fetch(`https://meta.fabricmc.net/v2/versions/loader/${mcVersion}`);
  const loaders = await loadersRes.json();
  if (!loaders.length) throw new Error(`Fabric no tiene loader disponible para Minecraft ${mcVersion}.`);
  const loaderVersion = loaders[0].loader.version; // más reciente

  const profileRes = await fetch(
    `https://meta.fabricmc.net/v2/versions/loader/${mcVersion}/${loaderVersion}/profile/json`
  );
  const profile = await profileRes.json();

  const libsDir = path.join(MC_DIR(), "libraries");
  const classpath = [];
  let i = 0;
  for (const lib of profile.libraries) {
    i++;
    onProgress?.({
      label: `Librerías de Fabric (${i}/${profile.libraries.length})`,
      pct: (i / profile.libraries.length) * 100,
    });
    const [group, artifact, version] = lib.name.split(":");
    const relPath = `${group.replace(/\./g, "/")}/${artifact}/${version}/${artifact}-${version}.jar`;
    const dest = path.join(libsDir, relPath);
    if (!fs.existsSync(dest)) {
      const baseUrl = (lib.url || "https://maven.fabricmc.net/").replace(/\/?$/, "/");
      await downloadFile(`${baseUrl}${relPath}`, dest);
    }
    classpath.push(dest);
  }
  return { profile, classpath, loaderVersion };
}

// ── options.txt básico (aplica algunos ajustes del panel Settings) ──
function buildOptionsTxt(settings) {
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  return [
    `renderDistance:${settings.renderDistance ?? 12}`,
    `simulationDistance:${settings.simulationDistance ?? 10}`,
    `maxFps:${settings.maxFps ?? 60}`,
    `fov:${(((settings.fov ?? 70) - 70) / 40).toFixed(2)}`,
    `enableVsync:${settings.vsync ? "true" : "false"}`,
    `fullscreen:${settings.fullscreen ? "true" : "false"}`,
    `guiScale:${settings.guiScale ?? 2}`,
    `soundCategory_master:${clamp01((settings.masterVol ?? 80) / 100)}`,
    `soundCategory_music:${clamp01((settings.musicVol ?? 70) / 100)}`,
    `soundCategory_voice:${clamp01((settings.voiceVol ?? 100) / 100)}`,
    `lang:es_es`,
  ].join("\n");
}

async function ensureOptionsTxt(settings) {
  const dest = path.join(MC_DIR(), "options.txt");
  if (!fs.existsSync(dest)) {
    await fsp.writeFile(dest, buildOptionsTxt(settings));
  }
}

module.exports = {
  MC_DIR,
  getVersionJson,
  ensureMinecraftClient,
  ensureLibrariesAndNatives,
  ensureAssets,
  ensureFabric,
  ensureOptionsTxt,
};
