// ══════════════════════════════════════════════════════════════
//  CONFIGURACIÓN REMOTA
//  Permite añadir/quitar mods y subir la versión SIN recompilar
//  ni redistribuir el .exe — el launcher simplemente lee un JSON
//  que tú subes a internet (GitHub raw, tu propio servidor, etc.)
// ══════════════════════════════════════════════════════════════
async function fetchRemoteConfig(url) {
  if (!url) return null;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    // Validación mínima de forma
    if (typeof data !== "object" || data === null) return null;
    return data; // { launcherVer, changelog, mods }
  } catch (_) {
    return null; // sin internet o URL inválida → el launcher sigue con su config local
  }
}

module.exports = { fetchRemoteConfig };
