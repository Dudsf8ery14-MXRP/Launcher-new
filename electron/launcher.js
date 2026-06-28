// ══════════════════════════════════════════════════════════════
//  LANZADOR REAL DE MINECRAFT
//  Construye el classpath, los argumentos JVM/juego siguiendo el
//  formato oficial "arguments" de los version.json de Mojang/Fabric,
//  y ejecuta java como un proceso hijo real.
// ══════════════════════════════════════════════════════════════
const { spawn } = require("child_process");
const { ensureJava17 } = require("./javaInstaller");
const {
  ensureMinecraftClient,
  ensureLibrariesAndNatives,
  ensureAssets,
  ensureFabric,
  ensureOptionsTxt,
  MC_DIR,
} = require("./minecraftInstaller");

function substituteVars(str, vars) {
  return str.replace(/\$\{(\w+)\}/g, (_, key) => (vars[key] !== undefined ? vars[key] : ""));
}

function ruleAllowsOs(rule) {
  if (!rule.os) return true;
  const map = { windows: "win32", osx: "darwin", linux: "linux" };
  if (rule.os.name && map[rule.os.name] !== process.platform) return false;
  return true;
}

// Resuelve un array "arguments.jvm" o "arguments.game" (formato Mojang 1.13+)
function resolveArgArray(argList, vars) {
  if (!argList) return [];
  const out = [];
  for (const item of argList) {
    if (typeof item === "string") {
      out.push(substituteVars(item, vars));
    } else if (item && typeof item === "object") {
      const allowed = (item.rules || []).every((r) => {
        const osOk = ruleAllowsOs(r);
        return r.action === "allow" ? osOk : !osOk;
      });
      if (allowed || !item.rules) {
        const vals = Array.isArray(item.value) ? item.value : [item.value];
        vals.forEach((v) => out.push(substituteVars(v, vars)));
      }
    }
  }
  return out;
}

async function launchMinecraft({ mcVersion, account, settings, serverIp, serverPort, onProgress }) {
  if (!account?.minecraftAccessToken || !account?.uuid || !account?.username) {
    throw new Error("No hay una cuenta de Microsoft autenticada. Inicia sesión primero.");
  }

  const javaPath = await ensureJava17(onProgress);
  const { versionJson, jarPath } = await ensureMinecraftClient(mcVersion, onProgress);
  const { classpath: vanillaCp, nativesDir } = await ensureLibrariesAndNatives(versionJson, onProgress);
  const { assetsDir, assetIndexId } = await ensureAssets(versionJson, onProgress);
  const { profile: fabricProfile, classpath: fabricCp } = await ensureFabric(mcVersion, onProgress);
  await ensureOptionsTxt(settings || {});

  const sep = process.platform === "win32" ? ";" : ":";
  const classpath = [...vanillaCp, ...fabricCp, jarPath].join(sep);
  const mainClass = fabricProfile.mainClass;

  const minRam = settings?.minRam || 4;
  const maxRam = settings?.maxRam || 8;

  const vars = {
    natives_directory: nativesDir,
    launcher_name: "MXRP Extremo Launcher",
    launcher_version: "2.1.0",
    classpath,
    auth_player_name: account.username,
    version_name: mcVersion,
    game_directory: MC_DIR(),
    assets_root: assetsDir,
    assets_index_name: assetIndexId,
    auth_uuid: account.uuid,
    auth_access_token: account.minecraftAccessToken,
    clientid: "-",
    auth_xuid: "-",
    user_type: "msa",
    version_type: versionJson.type || "release",
    resolution_width: 925,
    resolution_height: 530,
  };

  // Argumentos JVM/juego: Fabric hereda y extiende los del vanilla.
  const vanillaJvmArgs = resolveArgArray(versionJson.arguments?.jvm, vars);
  const fabricJvmArgs = resolveArgArray(fabricProfile.arguments?.jvm, vars);
  const vanillaGameArgs = resolveArgArray(versionJson.arguments?.game, vars);
  const fabricGameArgs = resolveArgArray(fabricProfile.arguments?.game, vars);

  const extraJvmArgs = (settings?.jvmArgs || "").split(" ").filter(Boolean);

  const fullArgs = [
    `-Xms${minRam}G`,
    `-Xmx${maxRam}G`,
    ...extraJvmArgs,
    ...vanillaJvmArgs,
    ...fabricJvmArgs,
    "-cp",
    classpath,
    mainClass,
    ...vanillaGameArgs,
    ...fabricGameArgs,
    "--server",
    serverIp,
    "--port",
    String(serverPort),
  ];

  onProgress?.({ label: "Iniciando proceso de Minecraft...", pct: 100 });

  const child = spawn(javaPath, fullArgs, { cwd: MC_DIR() });
  return child;
}

module.exports = { launchMinecraft };
