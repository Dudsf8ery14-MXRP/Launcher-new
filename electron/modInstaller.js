// ══════════════════════════════════════════════════════════════
//  DESCARGA DE MODS REALES — vía API pública de Modrinth
//  https://docs.modrinth.com/
// ══════════════════════════════════════════════════════════════
//
// ⚠️ LIMITACIÓN IMPORTANTE:
//   No todos los mods de tu lista están en Modrinth. La familia de
//   mods "FTB" (FTB Library, FTB Chunks, FTB Ranks, FTB Teams,
//   FTB XMod Compat) se distribuye principalmente en CurseForge y
//   puede no encontrarse aquí. Si un mod no se encuentra, el
//   instalador lo informa en el log pero NO detiene la instalación
//   — tendrás que añadirlo manualmente a la carpeta /mods, o
//   ampliar este archivo para usar la API de CurseForge (requiere
//   una API key gratuita: https://console.curseforge.com/).
//
// Para los mods que SÍ conocemos con certeza, usamos su slug exacto
// de Modrinth (más preciso que buscar por nombre). Para el resto,
// se usa una búsqueda por texto con coincidencia de mejor título.

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const { downloadFile } = require("./javaInstaller");

const SLUG_MAP = {
  "Fabric API": "fabric-api",
  "Architectury API": "architectury-api",
  AzureLib: "azurelib",
  Balm: "balm",
  "Cardinal Components API": "cardinal-components-api",
  "Cloth Config": "cloth-config",
  "Fabric Language Kotlin": "fabric-language-kotlin",
  GeckoLib: "geckolib",
  Indium: "indium",
  Sodium: "sodium",
  TerraBlender: "terrablender",
  Artifacts: "artifacts",
  "Better Combat": "better-combat",
  "Biomes O' Plenty": "biomes-o-plenty",
  Camerapture: "camerapture",
  Comforts: "comforts",
  "Carry On Wandering Bags": "carry-on",
  Handcrafted: "handcrafted",
  "Iris Shaders": "iris",
  "Roughly Enough Items": "rei",
  "Traveler's Backpack": "travelers-backpack",
  Trinkets: "trinkets",
  "Simple Voice Chat": "simple-voice-chat",
  Waystones: "waystones",
  "Xaero's Minimap": "xaeros-minimap",
  "Biome Compass": "biome-compass",
};

async function searchModrinthProject(modName) {
  const query = encodeURIComponent(modName);
  const res = await fetch(`https://api.modrinth.com/v2/search?query=${query}&limit=5`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.hits || [];
}

async function getCompatibleVersion(projectIdOrSlug, mcVersion) {
  const url = `https://api.modrinth.com/v2/project/${projectIdOrSlug}/version?loaders=%5B%22fabric%22%5D&game_versions=%5B%22${mcVersion}%22%5D`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const versions = await res.json();
  return versions[0] || null;
}

async function resolveProjectSlug(modName) {
  if (SLUG_MAP[modName]) return SLUG_MAP[modName];
  const hits = await searchModrinthProject(modName);
  if (!hits.length) return null;
  const best = hits.find((h) => h.title.toLowerCase() === modName.toLowerCase()) || hits[0];
  return best.slug || best.project_id;
}

async function downloadMod(modName, mcVersion, destDir, onProgress) {
  const slug = await resolveProjectSlug(modName);
  if (!slug) {
    onProgress?.({ label: `⚠️ No encontrado en Modrinth: ${modName}`, warn: true });
    return { ok: false, modName };
  }

  const version = await getCompatibleVersion(slug, mcVersion);
  if (!version) {
    onProgress?.({
      label: `⚠️ ${modName}: sin versión compatible con Fabric ${mcVersion} en Modrinth`,
      warn: true,
    });
    return { ok: false, modName };
  }

  const file = version.files.find((f) => f.primary) || version.files[0];
  const dest = path.join(destDir, file.filename);
  if (!fs.existsSync(dest)) {
    await downloadFile(file.url, dest);
  }
  onProgress?.({ label: `✓ ${modName} instalado`, pct: 100 });
  return { ok: true, modName };
}

async function downloadMods(modNames, mcVersion, destDir, onProgress) {
  await fsp.mkdir(destDir, { recursive: true });
  const results = [];
  for (let i = 0; i < modNames.length; i++) {
    const name = modNames[i];
    onProgress?.({
      label: `Instalando mods (${i + 1}/${modNames.length}): ${name}`,
      pct: (i / modNames.length) * 100,
    });
    try {
      results.push(await downloadMod(name, mcVersion, destDir, onProgress));
    } catch (e) {
      onProgress?.({ label: `⚠️ Error con ${name}: ${e.message}`, warn: true });
      results.push({ ok: false, modName: name, error: e.message });
    }
  }
  return results;
}

module.exports = { downloadMods, downloadMod };
