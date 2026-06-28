// ══════════════════════════════════════════════════════════════
//  ORQUESTADOR DE INSTALACIÓN COMPLETA
//  Encadena: Java 17 → Minecraft vanilla → librerías/natives →
//  assets → Fabric Loader → mods seleccionados.
// ══════════════════════════════════════════════════════════════
const path = require("path");
const { ensureJava17 } = require("./javaInstaller");
const {
  ensureMinecraftClient,
  ensureLibrariesAndNatives,
  ensureAssets,
  ensureFabric,
  MC_DIR,
} = require("./minecraftInstaller");
const { downloadMods } = require("./modInstaller");

async function runInstall({ mods, mcVersion, onProgress }) {
  await ensureJava17(onProgress);
  const { versionJson } = await ensureMinecraftClient(mcVersion, onProgress);
  await ensureLibrariesAndNatives(versionJson, onProgress);
  await ensureAssets(versionJson, onProgress);
  await ensureFabric(mcVersion, onProgress);

  const modsDir = path.join(MC_DIR(), "mods");
  const results = await downloadMods(mods, mcVersion, modsDir, onProgress);

  const failed = results.filter((r) => !r.ok);
  onProgress?.({
    label:
      failed.length === 0
        ? "¡Instalación completada!"
        : `Instalación completada con ${failed.length} mod(s) no encontrados`,
    pct: 100,
    done: true,
    failedMods: failed.map((f) => f.modName),
  });

  return { ok: true, failedMods: failed.map((f) => f.modName) };
}

module.exports = { runInstall };
