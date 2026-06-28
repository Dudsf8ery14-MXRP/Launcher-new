// ╔══════════════════════════════════════════════════════════════════╗
// ║          MXRP EXTREMO — ARCHIVO DE CONFIGURACIÓN                ║
// ║  Modifica este archivo para actualizar el launcher               ║
// ║  Cuando cambies LAUNCHER_VER, el launcher pedirá actualización  ║
// ╚══════════════════════════════════════════════════════════════════╝

export const CONFIG = {

  // ── VERSIÓN DEL LAUNCHER ───────────────────────────────────────
  // ⚠️  IMPORTANTE: Cada vez que modifiques algo, sube este número.
  //     El launcher detectará la diferencia y pedirá actualizar.
  //     Formato: "MAYOR.MENOR.PARCHE"
  //     Ejemplos: "2.1.0" → "2.1.1" (parche)
  //               "2.1.0" → "2.2.0" (nueva función)
  //               "2.1.0" → "3.0.0" (cambio grande)
  LAUNCHER_VER: "2.1.0",

  // ── SERVIDOR ──────────────────────────────────────────────────
  SERVER_IP:    "minecraft.egologic.cloud",
  SERVER_PORT:  25565,

  // ── MINECRAFT ─────────────────────────────────────────────────
  MC_VERSION:   "1.20.4",      // Versión de Minecraft fijada
  FABRIC_VER:   "0.15.7",      // Versión de Fabric Loader

  // ── NOVEDADES DE ESTA VERSIÓN ─────────────────────────────────
  // Aparecen en el popup de actualización. Añade los cambios aquí.
  CHANGELOG: [
    { ver: "2.1.0", date: "2024-06-01", changes: [
      "🎮 Launcher inicial MXRP EXTREMO",
      "🧩 38 mods del servidor incluidos",
      "⚙️ Settings completos de Minecraft",
      "🚀 Sistema de instalación automática",
    ]},
    // Agrega versiones nuevas ARRIBA así:
    // { ver: "2.2.0", date: "2024-07-01", changes: [
    //   "✨ Nueva pantalla de inicio",
    //   "🐛 Fix bug de instalación",
    //   "🧩 Añadido mod X",
    // ]},
  ],

  // ── MODS ──────────────────────────────────────────────────────
  // Para añadir un mod: copia una línea y rellena los datos.
  // Para quitar un mod: elimina su línea o pon enabled: false
  // required:true  → No se puede desactivar (librería esencial)
  // required:false → El usuario puede activar/desactivar
  MODS: [
    // ── LIBRERÍAS BASE (required: true) ────────────────────────
    { name:"Fabric API",              ver:"0.97.3",    size:"2.1 MB",  icon:"🧩", required:true,  cat:"lib",     desc:"API principal de Fabric — REQUERIDO" },
    { name:"Architectury API",        ver:"11.1.17",   size:"574 KB",  icon:"🏗️", required:true,  cat:"lib",     desc:"Librería base multiplataforma" },
    { name:"AzureLib",                ver:"2.1.24",    size:"785 KB",  icon:"🔷", required:true,  cat:"lib",     desc:"Librería de animaciones avanzadas" },
    { name:"Balm",                    ver:"9.0.9",     size:"388 KB",  icon:"⚖️", required:true,  cat:"lib",     desc:"API de compatibilidad de mods" },
    { name:"Cardinal Components API", ver:"5.4.0",     size:"225 KB",  icon:"🔧", required:true,  cat:"lib",     desc:"API de componentes para mods" },
    { name:"Cloth Config",            ver:"13.0.138",  size:"1.1 MB",  icon:"🔩", required:true,  cat:"lib",     desc:"Pantallas de configuración para mods" },
    { name:"Fabric Language Kotlin",  ver:"1.13.12",   size:"7.7 MB",  icon:"🟣", required:true,  cat:"lib",     desc:"Soporte Kotlin para mods Fabric" },
    { name:"FTB Library",             ver:"2004.2.5",  size:"757 KB",  icon:"📚", required:true,  cat:"lib",     desc:"Librería base de FTB" },
    { name:"FTB XMod Compat",         ver:"3.0.4",     size:"122 KB",  icon:"🔗", required:true,  cat:"lib",     desc:"Compatibilidad cruzada FTB" },
    { name:"GeckoLib",                ver:"4.4.4",     size:"994 KB",  icon:"🦎", required:true,  cat:"lib",     desc:"Librería de animaciones 3D" },
    { name:"GlitchCore",              ver:"1.0.0.59",  size:"320 KB",  icon:"⚡", required:true,  cat:"lib",     desc:"Núcleo para mods de Glitchfiend" },
    { name:"Indium",                  ver:"1.0.31",    size:"101 KB",  icon:"⚗️", required:true,  cat:"perf",    desc:"Compatibilidad Sodium + Fabric Render" },
    { name:"MC Extremo",              ver:"1.1.13",    size:"285 KB",  icon:"🎮", required:true,  cat:"server",  desc:"Mod principal del servidor MXRP" },
    { name:"Player Animation Lib",    ver:"1.0.2-rc1", size:"174 KB",  icon:"🕺", required:true,  cat:"lib",     desc:"Librería de animaciones de jugador" },
    { name:"Resourceful Lib",         ver:"2.4.10",    size:"430 KB",  icon:"📦", required:true,  cat:"lib",     desc:"Librería de recursos compartidos" },
    { name:"SmartBrainLib",           ver:"1.14.1",    size:"348 KB",  icon:"🧠", required:true,  cat:"lib",     desc:"IA avanzada para entidades" },
    { name:"Sodium",                  ver:"0.5.8",     size:"927 KB",  icon:"🟡", required:true,  cat:"perf",    desc:"Optimización de renderizado" },
    { name:"TerraBlender",            ver:"3.3.0.12",  size:"323 KB",  icon:"🌍", required:true,  cat:"world",   desc:"Mezcla de biomas para mods" },
    // ── MODS DE CONTENIDO (required: false) ────────────────────
    { name:"Artifacts",               ver:"10.0.11",   size:"903 KB",  icon:"🏺", required:false, cat:"content", desc:"Objetos especiales y reliquias" },
    { name:"Better Combat",           ver:"1.9.0",     size:"764 KB",  icon:"⚔️", required:false, cat:"gameplay",desc:"Sistema de combate mejorado" },
    { name:"Biomes O' Plenty",        ver:"19.0.0.90", size:"21.3 MB", icon:"🌿", required:false, cat:"world",   desc:"Más de 50 biomas nuevos" },
    { name:"BOMD",                    ver:"1.8.2",     size:"2.5 MB",  icon:"💣", required:false, cat:"gameplay",desc:"Nuevas mecánicas y mobs" },
    { name:"Camerapture",             ver:"1.6.3",     size:"3.3 MB",  icon:"📸", required:false, cat:"utility", desc:"Cámara y fotografía en el juego" },
    { name:"Comforts",                ver:"7.2.2",     size:"665 KB",  icon:"🛏️", required:false, cat:"gameplay",desc:"Sacos de dormir y hamacas" },
    { name:"Carry On Wandering Bags", ver:"3.0.0",     size:"78 KB",   icon:"🎒", required:false, cat:"utility", desc:"Bolsas para transportar objetos" },
    { name:"FTB Chunks",              ver:"2004.1.3",  size:"861 KB",  icon:"🗺️", required:false, cat:"server",  desc:"Reclamar y proteger chunks" },
    { name:"FTB Ranks",               ver:"2004.2.0",  size:"80 KB",   icon:"🏅", required:false, cat:"server",  desc:"Sistema de rangos para servidores" },
    { name:"FTB Teams",               ver:"2004.1.2",  size:"234 KB",  icon:"👥", required:false, cat:"server",  desc:"Equipos y grupos de jugadores" },
    { name:"Handcrafted",             ver:"3.2.1",     size:"6.8 MB",  icon:"🪑", required:false, cat:"content", desc:"Muebles y decoración artesanal" },
    { name:"HWG Mod",                 ver:"2.1.2",     size:"906 KB",  icon:"🔫", required:false, cat:"gameplay",desc:"Armas de fuego históricas" },
    { name:"Iris Shaders",            ver:"1.7.2",     size:"2.6 MB",  icon:"🌅", required:false, cat:"visual",  desc:"Soporte para shaderpacks" },
    { name:"Roughly Enough Items",    ver:"14.1.786",  size:"2.3 MB",  icon:"🔍", required:false, cat:"utility", desc:"Recetario y buscador de ítems (REI)" },
    { name:"Traveler's Backpack",     ver:"9.4.6",     size:"990 KB",  icon:"🎒", required:false, cat:"utility", desc:"Mochilas con tanques y herramientas" },
    { name:"Trinkets",                ver:"3.8.1",     size:"235 KB",  icon:"💍", required:false, cat:"gameplay",desc:"Ranuras de accesorios extra" },
    { name:"Simple Voice Chat",       ver:"2.5.22",    size:"7.8 MB",  icon:"🎙️", required:false, cat:"social",  desc:"Chat de voz en el juego" },
    { name:"Waystones",               ver:"16.0.5",    size:"236 KB",  icon:"🪨", required:false, cat:"utility", desc:"Piedras de teletransporte" },
    { name:"Xaero's Minimap",         ver:"26.1.0",    size:"2.1 MB",  icon:"🗺️", required:false, cat:"utility", desc:"Minimapa en pantalla" },
    { name:"Biome Compass",           ver:"1.3.1",     size:"98 KB",   icon:"🧭", required:false, cat:"utility", desc:"Brújula para encontrar biomas" },
    // ── AÑADIR NUEVO MOD ───────────────────────────────────────
    // Copia esta línea, pega abajo y rellena:
    // { name:"Nombre del Mod", ver:"1.0.0", size:"500 KB", icon:"🆕", required:false, cat:"utility", desc:"Descripción del mod" },
  ],

  // ── COLORES DEL TEMA ──────────────────────────────────────────
  // Modifica los colores del launcher aquí
  THEME: {
    primary:   "#00ff88",   // Verde principal (botones, texto destacado)
    primary2:  "#00cc66",   // Verde secundario
    dark:      "#070c07",   // Fondo oscuro
    card:      "#0c180c",   // Fondo de tarjetas
    border:    "#1a3320",   // Bordes
    text:      "#c8f0d0",   // Texto principal
    dim:       "#4a7a58",   // Texto secundario
    gold:      "#ffcc00",   // Color premium/gold
    red:       "#ff4444",   // Color de peligro
    // Para cambiar a tema azul por ejemplo:
    // primary: "#00aaff", primary2: "#0088cc", ...
  },

  // ── TEXTOS DE LA UI ───────────────────────────────────────────
  UI: {
    launcherName:  "MXRP EXTREMO",
    launcherSub:   "E X T R E M O",
    edition:       "FABRIC EDITION",
    serverLabel:   "Servidor MXRP",
    playBtn:       "Jugar en MXRP",
    settingsBtn:   "Opciones y ajustes",
    exitBtn:       "Salir del launcher",
    installBtn:    "Instalar MXRP Extremo",
    // Mensaje de bienvenida en el installer
    splashTagline: "Minecraft Roleplay · play.mxrp.net",
  },

  // ── AJUSTES POR DEFECTO ───────────────────────────────────────
  DEFAULTS: {
    minRam:    4,
    maxRam:    8,
    renderDistance:   12,
    simulationDistance: 10,
    maxFps:    60,
    fov:       70,
    brightness: 50,
    jvmArgs:   "-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200",
  },
};

// ══════════════════════════════════════════════════════════════
//  GUÍA RÁPIDA DE MODIFICACIONES
// ══════════════════════════════════════════════════════════════
//
//  📌 PARA PUBLICAR UNA ACTUALIZACIÓN:
//  1. Modifica lo que necesites en este archivo
//  2. Sube LAUNCHER_VER (ej: "2.1.0" → "2.1.1")
//  3. Añade los cambios en CHANGELOG con la nueva versión
//  4. Guarda el archivo → el launcher detectará la nueva versión
//     y mostrará el popup de actualización automáticamente
//
//  📌 PARA AÑADIR UN MOD:
//  - Ve a la sección MODS y añade una línea nueva
//  - Sube LAUNCHER_VER para que los usuarios actualicen y reciban el mod
//
//  📌 PARA CAMBIAR COLORES:
//  - Modifica THEME.primary con cualquier color hex
//  - Sube LAUNCHER_VER
//
//  📌 CATEGORÍAS DE MODS DISPONIBLES:
//  lib | perf | content | gameplay | world | utility | server | visual | social
//
