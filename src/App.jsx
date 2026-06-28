import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════
//  ⚙️  CONFIGURACIÓN PRINCIPAL — MODIFICA AQUÍ
//  Cuando cambies LAUNCHER_VER el launcher pedirá actualización
// ══════════════════════════════════════════════════════════════
const SERVER_IP    = "minecraft.egologic.cloud";
const SERVER_PORT  = 25565;
const MC_VERSION   = "1.20.4";
let LAUNCHER_VER = "2.1.0";   // ← SUBE ESTE NÚMERO AL MODIFICAR (o gestiónalo remotamente, ver abajo)

// URL pública (GitHub raw, tu servidor, etc.) que controla mods/versión SIN recompilar el .exe.
// Sube ahí tu propia copia de mxrp-remote-config.example.json y pon la URL aquí.
const CONFIG_URL = "https://github.com/Dudsf8ery14-MXRP/LAUNCHER"; // ej: "https://raw.githubusercontent.com/tu-usuario/tu-repo/main/mxrp-remote-config.json"

// Historial de cambios — aparece en el popup de actualización
let CHANGELOG = [
  { ver:"2.1.0", date:"2025-06-01", label:"🚀 Lanzamiento", changes:[
    "🎮 Launcher MXRP EXTREMO inicial",
    "🧩 39 mods del servidor incluidos",
    "⚙️  Settings completos de Minecraft",
    "🚀 Sistema de instalación automática",
    "🌐 Servidor: minecraft.egologic.cloud",
  ]},
  // ── AÑADE NUEVAS VERSIONES AQUÍ (arriba de las anteriores) ──
  // { ver:"2.2.0", date:"2025-07-01", label:"✨ Nueva función", changes:[
  //   "✨ Descripción del cambio 1",
  //   "🐛 Fix de bug X",
  //   "🧩 Añadido nuevo mod Y",
  // ]},
];

let MODS = [
  { name:"Architectury API",        ver:"11.1.17",    size:"574 KB",  icon:"🏗️", required:true,  cat:"lib",     desc:"Librería base multiplataforma" },
  { name:"Artifacts",               ver:"10.0.11",    size:"903 KB",  icon:"🏺", required:false, cat:"content", desc:"Objetos especiales y reliquias" },
  { name:"AzureLib",                ver:"2.1.24",     size:"785 KB",  icon:"🔷", required:true,  cat:"lib",     desc:"Librería de animaciones avanzadas" },
  { name:"Balm",                    ver:"9.0.9",      size:"388 KB",  icon:"⚖️", required:true,  cat:"lib",     desc:"API de compatibilidad de mods" },
  { name:"Better Combat",           ver:"1.9.0",      size:"764 KB",  icon:"⚔️", required:false, cat:"gameplay",desc:"Sistema de combate mejorado" },
  { name:"Biomes O' Plenty",        ver:"19.0.0.90",  size:"21.3 MB", icon:"🌿", required:false, cat:"world",   desc:"Más de 50 biomas nuevos" },
  { name:"BOMD",                    ver:"1.8.2",      size:"2.5 MB",  icon:"💣", required:false, cat:"gameplay",desc:"Nuevas mecánicas y mobs" },
  { name:"Camerapture",             ver:"1.6.3",      size:"3.3 MB",  icon:"📸", required:false, cat:"utility", desc:"Cámara y fotografía en el juego" },
  { name:"Cardinal Components API", ver:"5.4.0",      size:"225 KB",  icon:"🔧", required:true,  cat:"lib",     desc:"API de componentes para mods" },
  { name:"Cloth Config",            ver:"13.0.138",   size:"1.1 MB",  icon:"🔩", required:true,  cat:"lib",     desc:"Pantallas de configuración para mods" },
  { name:"Comforts",                ver:"7.2.2",      size:"665 KB",  icon:"🛏️", required:false, cat:"gameplay",desc:"Sacos de dormir y hamacas" },
  { name:"Carry On Wandering Bags", ver:"3.0.0",      size:"78 KB",   icon:"🎒", required:false, cat:"utility", desc:"Bolsas para transportar objetos" },
  { name:"Fabric API",              ver:"0.97.3",     size:"2.1 MB",  icon:"🧩", required:true,  cat:"lib",     desc:"API principal de Fabric — REQUERIDO" },
  { name:"Fabric Language Kotlin",  ver:"1.13.12",    size:"7.7 MB",  icon:"🟣", required:true,  cat:"lib",     desc:"Soporte Kotlin para mods Fabric" },
  { name:"FTB Chunks",              ver:"2004.1.3",   size:"861 KB",  icon:"🗺️", required:false, cat:"server",  desc:"Reclamar y proteger chunks" },
  { name:"FTB Library",             ver:"2004.2.5",   size:"757 KB",  icon:"📚", required:true,  cat:"lib",     desc:"Librería base de FTB" },
  { name:"FTB Ranks",               ver:"2004.2.0",   size:"80 KB",   icon:"🏅", required:false, cat:"server",  desc:"Sistema de rangos para servidores" },
  { name:"FTB Teams",               ver:"2004.1.2",   size:"234 KB",  icon:"👥", required:false, cat:"server",  desc:"Equipos y grupos de jugadores" },
  { name:"FTB XMod Compat",         ver:"3.0.4",      size:"122 KB",  icon:"🔗", required:true,  cat:"lib",     desc:"Compatibilidad cruzada FTB" },
  { name:"GeckoLib",                ver:"4.4.4",      size:"994 KB",  icon:"🦎", required:true,  cat:"lib",     desc:"Librería de animaciones 3D" },
  { name:"GlitchCore",              ver:"1.0.0.59",   size:"320 KB",  icon:"⚡", required:true,  cat:"lib",     desc:"Núcleo para mods de Glitchfiend" },
  { name:"Handcrafted",             ver:"3.2.1",      size:"6.8 MB",  icon:"🪑", required:false, cat:"content", desc:"Muebles y decoración artesanal" },
  { name:"HWG Mod",                 ver:"2.1.2",      size:"906 KB",  icon:"🔫", required:false, cat:"gameplay",desc:"Armas de fuego históricas" },
  { name:"Indium",                  ver:"1.0.31",     size:"101 KB",  icon:"⚗️", required:true,  cat:"perf",    desc:"Compatibilidad Sodium + Fabric Render" },
  { name:"Iris Shaders",            ver:"1.7.2",      size:"2.6 MB",  icon:"🌅", required:false, cat:"visual",  desc:"Soporte para shaderpacks" },
  { name:"MC Extremo",              ver:"1.1.13",     size:"285 KB",  icon:"🎮", required:true,  cat:"server",  desc:"Mod principal del servidor MXRP" },
  { name:"Player Animation Lib",    ver:"1.0.2-rc1",  size:"174 KB",  icon:"🕺", required:true,  cat:"lib",     desc:"Librería de animaciones de jugador" },
  { name:"Resourceful Lib",         ver:"2.4.10",     size:"430 KB",  icon:"📦", required:true,  cat:"lib",     desc:"Librería de recursos compartidos" },
  { name:"Roughly Enough Items",    ver:"14.1.786",   size:"2.3 MB",  icon:"🔍", required:false, cat:"utility", desc:"Recetario y buscador de ítems (REI)" },
  { name:"SmartBrainLib",           ver:"1.14.1",     size:"348 KB",  icon:"🧠", required:true,  cat:"lib",     desc:"IA avanzada para entidades" },
  { name:"Sodium",                  ver:"0.5.8",      size:"927 KB",  icon:"🟡", required:true,  cat:"perf",    desc:"Optimización de renderizado" },
  { name:"TerraBlender",            ver:"3.3.0.12",   size:"323 KB",  icon:"🌍", required:true,  cat:"world",   desc:"Mezcla de biomas para mods" },
  { name:"Traveler's Backpack",     ver:"9.4.6",      size:"990 KB",  icon:"🎒", required:false, cat:"utility", desc:"Mochilas con tanques y herramientas" },
  { name:"Trinkets",                ver:"3.8.1",      size:"235 KB",  icon:"💍", required:false, cat:"gameplay",desc:"Ranuras de accesorios extra" },
  { name:"Simple Voice Chat",       ver:"2.5.22",     size:"7.8 MB",  icon:"🎙️", required:false, cat:"social",  desc:"Chat de voz en el juego" },
  { name:"Waystones",               ver:"16.0.5",     size:"236 KB",  icon:"🪨", required:false, cat:"utility", desc:"Piedras de teletransporte" },
  { name:"Xaero's Minimap",         ver:"26.1.0",     size:"2.1 MB",  icon:"🗺️", required:false, cat:"utility", desc:"Minimapa en pantalla" },
  { name:"Biome Compass",           ver:"1.3.1",      size:"98 KB",   icon:"🧭", required:false, cat:"utility", desc:"Brújula para encontrar biomas" },
];

const CAT_LABELS = {
  all:"Todos", lib:"Librerías", perf:"Rendimiento", content:"Contenido",
  gameplay:"Gameplay", world:"Mundo", utility:"Utilidad", server:"Servidor",
  visual:"Visual", social:"Social",
};

const INSTALL_STEPS = [
  {label:"Verificando sistema",           detail:"Comprobando requisitos mínimos..."},
  {label:"Descargando Java 17",           detail:"OpenJDK 17.0.9 x64 — ~180 MB"},
  {label:"Instalando Java 17",            detail:"Configurando entorno de ejecución..."},
  {label:"Descargando Fabric Installer",  detail:"fabric-installer-0.15.7.jar"},
  {label:"Instalando Fabric Loader",      detail:"Perfil Minecraft "+MC_VERSION+"..."},
  {label:"Descargando Minecraft",         detail:"Cliente MC "+MC_VERSION+" + assets — ~450 MB"},
  {label:"Extrayendo assets",             detail:"Texturas, sonidos, idiomas..."},
  {label:"Instalando mods — librerías",   detail:"Fabric API, GeckoLib, Architectury..."},
  {label:"Instalando mods — contenido",   detail:"Biomes O' Plenty, Handcrafted, Artifacts..."},
  {label:"Instalando mods — servidor",    detail:"MC Extremo, FTB Teams, FTB Ranks..."},
  {label:"Instalando mods — utilidad",    detail:"Waystones, Xaero Minimap, REI, Voice Chat..."},
  {label:"Configurando perfil MXRP",      detail:"Aplicando ajustes y tema del launcher..."},
  {label:"Verificando integridad",        detail:"Comprobando checksums SHA-256..."},
  {label:"Creando acceso directo",        detail:"Escritorio y menú de inicio..."},
  {label:"¡Instalación completada!",      detail:"MXRP EXTREMO listo para jugar."},
];

const DEF_SETTINGS = {
  username:"Player", mode:"nopremium",
  minRam:4, maxRam:8,
  jvmArgs:"-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions",
  renderDistance:12, simulationDistance:10, maxFps:60, vsync:true,
  fov:70, brightness:50, guiScale:2, fullscreen:false,
  graphicsMode:"Fancy", particles:"All", clouds:"Fancy",
  smoothLighting:true, entityShadows:true, ambientOcclusion:true,
  mipmap:4, bobView:true, attackIndicator:"Crosshair",
  masterVol:80, musicVol:70, weatherVol:60, blockVol:100,
  hostileVol:100, friendlyVol:100, ambientVol:80, voiceVol:100,
  sensitivity:50, rawInput:true, invertMouse:false, autoJump:false,
  toggleSprint:false, toggleSneak:false,
  chatVisible:"Shown", chatColors:true, chatLinks:true,
  chatOpacity:100, chatScale:100, chatWidth:320,
  narrator:"Off", subtitles:false, highContrast:false,
  activeMods: MODS.map(m=>m.name),
};

// ── PALETTE ──────────────────────────────────────────────────
const C = {
  g:"#00ff88", g2:"#00cc66", dark:"#070c07",
  card:"#0c180c", card2:"#0f1e0f", border:"#1a3320",
  text:"#c8f0d0", dim:"#4a7a58", gold:"#ffcc00",
  red:"#ff4444", red2:"#cc2222",
};

// ══════════════════════════════════════════════════════════════
//  UPDATE SYSTEM — detección y popup de actualización
// ══════════════════════════════════════════════════════════════

// Compara versiones semver: retorna true si newVer > currentVer
function isNewerVersion(current, next) {
  const p = s => s.split(".").map(Number);
  const [ca,cb,cc] = p(current);
  const [na,nb,nc] = p(next);
  if(na!==ca) return na>ca;
  if(nb!==cb) return nb>cb;
  return nc>cc;
}

// Hook: detecta si la versión instalada difiere de la actual
function useUpdateCheck() {
  const STORAGE_KEY = "mxrp_installed_ver";
  const [updateState, setUpdateState] = useState(null);
  // null = checking | "fresh" = primera vez | "update" = hay actualización | "ok" = al día

  useEffect(()=>{
    const check = async () => {
      try {
        let installed = null;
        try { const r = await window.mxrp.store.get(STORAGE_KEY); installed = r?.value || null; }
        catch(_) { installed = null; }

        if(!installed) {
          // Primera instalación
          setUpdateState("fresh");
        } else if(isNewerVersion(installed, LAUNCHER_VER)) {
          setUpdateState({ type:"update", from: installed, to: LAUNCHER_VER });
        } else {
          setUpdateState("ok");
        }
      } catch(_) { setUpdateState("ok"); }
    };
    check();
  }, []);

  const markInstalled = async () => {
    try { await window.mxrp.store.set("mxrp_installed_ver", LAUNCHER_VER); } catch(_) {}
    setUpdateState("ok");
  };

  return { updateState, markInstalled };
}

// ── POPUP DE ACTUALIZACIÓN ────────────────────────────────────
function UpdatePopup({ from, to, onUpdate, onDismiss }) {
  const [updating, setUpdating] = useState(false);
  const [upPct, setUpPct]       = useState(0);
  const [done,  setDone]        = useState(false);

  const latestChanges = CHANGELOG.find(c=>c.ver===to);
  const prevChanges   = CHANGELOG.filter(c=>c.ver!==to);

  const runUpdate = () => {
    setUpdating(true);
    let p = 0;
    const iv = setInterval(()=>{
      p += Math.random()*18 + 5;
      if(p >= 100){ p=100; clearInterval(iv); setTimeout(()=>setDone(true), 400); }
      setUpPct(Math.round(p));
    }, 220);
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:500,
      background:"rgba(0,0,0,.88)",backdropFilter:"blur(6px)",
      display:"flex",alignItems:"center",justifyContent:"center",
      animation:"fadeInFast .2s ease",padding:16}}>
      <div style={{background:C.card,border:`2px solid ${C.g}`,borderRadius:12,
        width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",
        boxShadow:`0 0 60px #00ff8822, 0 0 120px #00000090`,
        animation:"fadeIn .3s ease"}}>

        {done ? (
          /* ── DONE ── */
          <div style={{textAlign:"center",padding:"40px 32px"}}>
            <div style={{fontSize:60,marginBottom:16,animation:"pulse 2s infinite"}}>✅</div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:900,
              color:C.g,marginBottom:8}}>¡ACTUALIZACIÓN COMPLETA!</div>
            <div style={{fontSize:13,color:C.dim,marginBottom:28}}>
              MXRP EXTREMO v{to} instalado correctamente
            </div>
            <button onClick={onUpdate} style={{
              fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:700,
              letterSpacing:2,color:"#000",
              background:`linear-gradient(135deg,${C.g2},${C.g})`,
              border:"none",borderRadius:6,padding:"13px 36px",cursor:"pointer",
              boxShadow:`0 0 24px ${C.g}44`}}>
              ▶ Continuar al launcher
            </button>
          </div>
        ) : updating ? (
          /* ── UPDATING ── */
          <div style={{padding:"36px 32px",textAlign:"center"}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:700,
              color:C.g,marginBottom:6}}>ACTUALIZANDO...</div>
            <div style={{fontSize:12,color:C.dim,marginBottom:28}}>
              v{from} → v{to} · No cierres esta ventana
            </div>
            <div style={{height:10,background:"#060e07",borderRadius:5,overflow:"hidden",
              border:`1px solid ${C.border}`,marginBottom:8}}>
              <div style={{height:"100%",width:`${upPct}%`,borderRadius:5,
                background:`linear-gradient(90deg,${C.g2},${C.g})`,
                transition:"width .25s ease",animation:"glow 2s ease-in-out infinite"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
              <span style={{color:C.dim}}>Descargando parches...</span>
              <span style={{fontFamily:"'Orbitron',monospace",color:C.g,fontWeight:700}}>{upPct}%</span>
            </div>
          </div>
        ) : (
          /* ── UPDATE AVAILABLE ── */
          <>
            {/* Header */}
            <div style={{padding:"24px 28px 0",textAlign:"center"}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:8,
                background:"#ffcc0015",border:"1px solid #ffcc0040",
                borderRadius:20,padding:"4px 14px",marginBottom:16,
                fontSize:11,color:C.gold,letterSpacing:2}}>
                ⬆ ACTUALIZACIÓN DISPONIBLE
              </div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:22,fontWeight:900,color:"#fff",
                marginBottom:4}}>
                v{from} → <span style={{color:C.g}}>v{to}</span>
              </div>
              <div style={{fontSize:12,color:C.dim,marginBottom:20}}>
                MXRP EXTREMO · {latestChanges?.label||"Nueva versión"}
              </div>
            </div>

            {/* Version diff badge */}
            <div style={{margin:"0 28px 18px",display:"flex",gap:10,justifyContent:"center"}}>
              <div style={{background:"#0a120b",border:`1px solid ${C.border}`,borderRadius:6,
                padding:"8px 16px",textAlign:"center",flex:1}}>
                <div style={{fontSize:10,color:C.dim,letterSpacing:2,marginBottom:3}}>INSTALADA</div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,color:"#4a7a58"}}>v{from}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",fontSize:20,color:C.g2}}>→</div>
              <div style={{background:"#0e2016",border:`1px solid ${C.g}`,borderRadius:6,
                padding:"8px 16px",textAlign:"center",flex:1,
                boxShadow:`0 0 12px ${C.g}18`}}>
                <div style={{fontSize:10,color:C.g2,letterSpacing:2,marginBottom:3}}>NUEVA</div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,color:C.g}}>v{to}</div>
              </div>
            </div>

            {/* Changelog */}
            {latestChanges && (
              <div style={{margin:"0 28px 18px",background:"#0a120b",
                border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 16px"}}>
                <div style={{fontSize:10,letterSpacing:3,color:C.g2,
                  textTransform:"uppercase",marginBottom:10}}>
                  Novedades de v{to}
                </div>
                {latestChanges.changes.map((ch,i)=>(
                  <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",
                    marginBottom:7,fontSize:12,color:C.text}}>
                    <span style={{marginTop:1,flexShrink:0}}>{ch.split(" ")[0]}</span>
                    <span style={{color:"#a0d0b0"}}>{ch.split(" ").slice(1).join(" ")}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Previous versions (collapsible hint) */}
            {prevChanges.length > 0 && (
              <div style={{margin:"0 28px 20px",fontSize:11,color:"#2a5535",textAlign:"center"}}>
                + {prevChanges.reduce((a,c)=>a+c.changes.length,0)} cambios en versiones anteriores
              </div>
            )}

            {/* Action buttons */}
            <div style={{padding:"0 28px 24px",display:"flex",flexDirection:"column",gap:10}}>
              <button onClick={runUpdate} style={{
                fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:700,
                letterSpacing:2,color:"#000",width:"100%",
                background:`linear-gradient(135deg,${C.g2},${C.g})`,
                border:"none",borderRadius:6,padding:"14px",cursor:"pointer",
                boxShadow:`0 0 20px ${C.g}33`,transition:"all .2s"}}
                onMouseEnter={e=>e.target.style.boxShadow=`0 0 32px ${C.g}55`}
                onMouseLeave={e=>e.target.style.boxShadow=`0 0 20px ${C.g}33`}>
                ⬆ ACTUALIZAR AHORA
              </button>
              <button onClick={onDismiss} style={{
                background:"none",border:`1px solid ${C.border}`,borderRadius:6,
                color:C.dim,padding:"11px",cursor:"pointer",fontSize:12,
                fontFamily:"'Rajdhani',sans-serif",fontWeight:600,width:"100%",
                transition:"all .2s"}}
                onMouseEnter={e=>{e.target.style.borderColor=C.g2;e.target.style.color=C.text;}}
                onMouseLeave={e=>{e.target.style.borderColor=C.border;e.target.style.color=C.dim;}}>
                Recordar más tarde
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── PRIMER USO: popup de bienvenida ──────────────────────────
function WelcomePopup({ ver, onContinue }) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:500,
      background:"rgba(0,0,0,.88)",backdropFilter:"blur(6px)",
      display:"flex",alignItems:"center",justifyContent:"center",
      animation:"fadeInFast .2s ease",padding:16}}>
      <div style={{background:C.card,border:`2px solid ${C.g}`,borderRadius:12,
        width:"100%",maxWidth:420,padding:"36px 32px",textAlign:"center",
        boxShadow:`0 0 60px #00ff8822`,animation:"fadeIn .3s ease"}}>
        <div style={{fontSize:52,marginBottom:16,animation:"pulse 2s infinite"}}>🎮</div>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:20,fontWeight:900,
          color:C.g,marginBottom:4}}>¡BIENVENIDO!</div>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,color:C.g2,
          letterSpacing:4,marginBottom:20}}>MXRP EXTREMO v{ver}</div>
        <div style={{fontSize:12,color:C.dim,lineHeight:1.7,marginBottom:24}}>
          Launcher instalado correctamente.<br/>
          Servidor: <span style={{color:C.g,fontFamily:"monospace"}}>{SERVER_IP}</span><br/>
          Minecraft {MC_VERSION} · 38 mods Fabric
        </div>
        <button onClick={onContinue} style={{
          fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:700,
          letterSpacing:2,color:"#000",width:"100%",
          background:`linear-gradient(135deg,${C.g2},${C.g})`,
          border:"none",borderRadius:6,padding:"14px",cursor:"pointer",
          boxShadow:`0 0 20px ${C.g}33`}}>
          ▶ EMPEZAR
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  GLOBAL CSS
// ══════════════════════════════════════════════════════════════
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    ::-webkit-scrollbar{width:5px;}
    ::-webkit-scrollbar-track{background:#070c07;}
    ::-webkit-scrollbar-thumb{background:#1a3320;border-radius:3px;}
    input,select{font-family:'Rajdhani',sans-serif;}
    @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeInFast{from{opacity:0}to{opacity:1}}
    @keyframes floatUp{0%{transform:translateY(0);opacity:0}10%{opacity:.4}90%{opacity:.15}100%{transform:translateY(-100vh);opacity:0}}
    @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes glow{0%,100%{box-shadow:0 0 8px #00ff88}50%{box-shadow:0 0 22px #00ff88,0 0 44px #00ff8840}}
    @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(200vh)}}
    @keyframes shimmerBtn{0%{left:-100%}100%{left:200%}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
    @keyframes slideIn{from{transform:translateX(-8px);opacity:0}to{transform:translateX(0);opacity:1}}
  `}</style>
);

// ══════════════════════════════════════════════════════════════
//  SHARED COMPONENTS
// ══════════════════════════════════════════════════════════════

function Particles() {
  const pts = Array.from({length:20},(_,i)=>({
    id:i, left:Math.random()*100, size:Math.random()*2+1,
    dur:Math.random()*14+8, delay:Math.random()*14,
  }));
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}>
      {pts.map(p=>(
        <div key={p.id} style={{position:"absolute",left:`${p.left}%`,bottom:-10,
          width:p.size,height:p.size,borderRadius:"50%",background:C.g,
          animation:`floatUp ${p.dur}s ${p.delay}s linear infinite`,opacity:0}}/>
      ))}
    </div>
  );
}

// Minecraft-pixel button
function Btn({children,onClick,danger=false,gold=false,disabled=false,size="md",style:sx={}}) {
  const [h,sH]=useState(false);
  const base={
    display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",
    fontFamily:"'Orbitron',monospace",fontWeight:700,textTransform:"uppercase",
    border:"2px solid",borderRadius:4,cursor:disabled?"not-allowed":"pointer",
    transition:"all .15s",position:"relative",overflow:"hidden",
    padding: size==="sm"?"8px 14px": size==="lg"?"16px 24px":"12px 18px",
    fontSize: size==="sm"?11: size==="lg"?15:13,
    letterSpacing: size==="sm"?1:2,
  };
  const col = disabled ? {bg:"#0a120b",bc:C.border,color:"#2a5535"}
    : danger ? {bg:h?"#bb2020":"#7a0e0e",bc:h?"#ff6666":C.red2,color:"#ffaaaa"}
    : gold   ? {bg:h?"#bb9900":"#7a6600",bc:h?"#ffdd44":C.gold,color:"#ffe070"}
    : {bg:h?"#006622":"#003d13",bc:h?C.g:"#004411",color:"#fff"};
  return (
    <button onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)}
      onClick={disabled?undefined:onClick}
      style={{...base,background:col.bg,borderColor:col.bc,color:col.color,
        boxShadow:h&&!disabled?`0 0 18px ${danger?"#ff444430":gold?"#ffcc0020":"#00ff8828"}`:"none",...sx}}>
      {h&&!disabled&&<div style={{position:"absolute",inset:0,
        background:"linear-gradient(180deg,rgba(255,255,255,.07),transparent 55%)",
        pointerEvents:"none"}}/>}
      {children}
    </button>
  );
}

function Slider({label,value,min,max,step=1,unit="",onChange,hint=""}) {
  return (
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,alignItems:"baseline"}}>
        <span style={{fontSize:12,color:C.text}}>{label}</span>
        <span style={{fontFamily:"'Orbitron',monospace",fontSize:11,color:C.g,minWidth:60,textAlign:"right"}}>{value}{unit}</span>
      </div>
      {hint&&<div style={{fontSize:10,color:C.dim,marginBottom:5}}>{hint}</div>}
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(Number(e.target.value))}
        style={{width:"100%",accentColor:C.g,cursor:"pointer",height:4}}/>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
        <span style={{fontSize:9,color:"#1a4020"}}>{min}{unit}</span>
        <span style={{fontSize:9,color:"#1a4020"}}>{max}{unit}</span>
      </div>
    </div>
  );
}

function Toggle({label,value,onChange,hint=""}) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
      marginBottom:13,gap:12,cursor:"pointer"}} onClick={()=>onChange(!value)}>
      <div style={{flex:1}}>
        <div style={{fontSize:12,color:C.text}}>{label}</div>
        {hint&&<div style={{fontSize:10,color:C.dim,marginTop:2}}>{hint}</div>}
      </div>
      <div style={{width:44,height:23,borderRadius:12,flexShrink:0,
        background:value?"#006622":"#1a3320",
        border:`1px solid ${value?C.g:"#2a5535"}`,
        position:"relative",transition:"all .2s"}}>
        <div style={{position:"absolute",top:2,left:value?23:2,width:17,height:17,
          borderRadius:"50%",background:value?C.g:"#2a5535",
          boxShadow:value?`0 0 6px ${C.g}`:"none",
          transition:"all .2s"}}/>
      </div>
    </div>
  );
}

function Select({label,value,options,onChange}) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:13,gap:12}}>
      <span style={{fontSize:12,color:C.text,flex:1}}>{label}</span>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{
        background:"#0a120b",border:`1px solid ${C.border}`,color:C.text,
        fontSize:12,padding:"6px 10px",borderRadius:4,outline:"none",cursor:"pointer",minWidth:130,
      }}>{options.map(o=><option key={o} value={o}>{o}</option>)}</select>
    </div>
  );
}

function SCard({title,icon,children,accent=false}) {
  return (
    <div style={{background:accent?"#0f2018":C.card,
      border:`1px solid ${accent?"#1e4a2a":C.border}`,
      borderRadius:8,padding:"18px 20px",marginBottom:14}}>
      <div style={{fontSize:11,letterSpacing:3,color:C.g2,textTransform:"uppercase",
        marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
        <span>{icon}</span>{title}
        <div style={{flex:1,height:1,background:accent?"#1e4a2a":C.border}}/>
      </div>
      {children}
    </div>
  );
}

function TextInput({label,value,onChange,mono=false,hint=""}) {
  return (
    <div style={{marginBottom:14}}>
      {label&&<div style={{fontSize:12,color:C.text,marginBottom:6}}>{label}</div>}
      {hint&&<div style={{fontSize:10,color:C.dim,marginBottom:5}}>{hint}</div>}
      <input value={value} onChange={e=>onChange(e.target.value)} style={{
        width:"100%",background:"#060e07",border:`1px solid ${C.border}`,borderRadius:6,
        color:mono?C.g2:C.text,fontFamily:mono?"monospace":"'Rajdhani',sans-serif",
        fontSize:mono?12:14,padding:"10px 14px",outline:"none",
        transition:"border-color .2s"
      }}
      onFocus={e=>e.target.style.borderColor=C.g2}
      onBlur={e=>e.target.style.borderColor=C.border}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  SCREEN: INSTALLER
// ══════════════════════════════════════════════════════════════
function Installer({onDone}) {
  const [phase, setPhase] = useState("splash"); // splash|config|installing|done
  const [mode,   setMode]  = useState(null);
  const [dir,    setDir]   = useState("C:\\MXRP_Extremo");
  const [mods,   setMods]  = useState(new Set(MODS.map(m=>m.name)));
  const [cat,    setCat]   = useState("all");
  const [search, setSearch]= useState("");
  const [step,   setStep]  = useState(0);
  const [pct,    setPct]   = useState(0);
  const [done,   setDone]  = useState([]);
  const [err,    setErr]   = useState("");
  const logRef = useRef(null);

  // ── LOGIN REAL CON MICROSOFT ──────────────────────────────────
  const [loginState, setLoginState] = useState("idle"); // idle|waiting|done|error
  const [deviceInfo, setDeviceInfo] = useState(null);   // {userCode, verificationUri, expiresIn}
  const [mcProfile,  setMcProfile]  = useState(null);   // cuenta autenticada de Minecraft
  const [installLog, setInstallLog] = useState([]);     // log real de progreso de instalación
  const [secsLeft,   setSecsLeft]   = useState(null);   // cuenta regresiva del código (segundos)

  // Cuenta regresiva visual mientras esperamos que el usuario complete el login
  useEffect(()=>{
    if(loginState!=="waiting"||!deviceInfo) return;
    setSecsLeft(deviceInfo.expiresIn||900);
    const id = setInterval(()=>{
      setSecsLeft(s=>{
        if(s<=1){
          clearInterval(id);
          setLoginState("error");
          setErr("⏱️ El código expiró. Pulsa de nuevo para generar uno nuevo.");
          return 0;
        }
        return s-1;
      });
    },1000);
    return ()=>clearInterval(id);
  },[loginState,deviceInfo]);

  const fmtTime = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  // Intenta restaurar una sesión guardada al abrir el instalador
  useEffect(()=>{
    window.mxrp?.auth?.tryRestore?.().then(profile=>{
      if(profile){ setMcProfile(profile); setMode("premium"); setLoginState("done"); }
    });
  },[]);

  const doLogin = async () => {
    setErr(""); setLoginState("waiting"); setDeviceInfo(null);
    const off = window.mxrp?.auth?.onDeviceCode?.(info=>setDeviceInfo(info));
    try {
      const profile = await window.mxrp.auth.login();
      setMcProfile(profile); setMode("premium"); setLoginState("done");
    } catch(e) {
      setLoginState("error");
      setErr("❌ "+(e.message||"No se pudo iniciar sesión con Microsoft."));
    } finally {
      off?.();
    }
  };

  const toggleMod = n => {
    if(MODS.find(m=>m.name===n)?.required) return;
    const s=new Set(mods); s.has(n)?s.delete(n):s.add(n); setMods(s);
  };
  const toggleAll = () => {
    const opt = MODS.filter(m=>!m.required).map(m=>m.name);
    const allOn = opt.every(n=>mods.has(n));
    const s = new Set(mods);
    opt.forEach(n=>allOn?s.delete(n):s.add(n));
    setMods(s);
  };

  // ── INSTALACIÓN REAL (Java + Minecraft + Fabric + mods) ───────
  const startInstall = async () => {
    if(!mode||!mcProfile){setErr("⚠️ Inicia sesión con tu cuenta de Microsoft primero.");return;}
    setErr(""); setPhase("installing"); setPct(0); setInstallLog([]);

    const off = window.mxrp?.install?.onProgress?.(p=>{
      setPct(Math.round(p.pct||0));
      setInstallLog(log=>{
        if(log.length && log[log.length-1].label===p.label) return log;
        return [...log, p];
      });
    });

    try {
      const res = await window.mxrp.install.run({ mods:[...mods], mcVersion: MC_VERSION });
      off?.();
      if(res?.failedMods?.length){
        setErr(`⚠️ No se encontraron en Modrinth: ${res.failedMods.join(", ")}. Puedes añadirlos manualmente a la carpeta /mods.`);
      }
      setPhase("done");
    } catch(e) {
      off?.();
      setErr("❌ "+(e.message||"Error durante la instalación real."));
      setPhase("config");
    }
  };

  useEffect(()=>{
    logRef.current?.querySelector("[data-active]")?.scrollIntoView({behavior:"smooth",block:"nearest"});
  },[installLog.length]);

  const filtered = MODS.filter(m=>
    (cat==="all"||m.cat===cat)&&
    (m.name.toLowerCase().includes(search.toLowerCase())||m.desc.toLowerCase().includes(search.toLowerCase()))
  );

  const totalMB = MODS.filter(m=>mods.has(m.name))
    .reduce((a,m)=>a+parseFloat(m.size),0).toFixed(1);

  // ── SPLASH ─────────────────────────────────────────────────
  if(phase==="splash") return (
    <div style={{textAlign:"center",padding:"48px 24px 40px",animation:"fadeIn .5s ease"}}>
      <div style={{fontSize:11,letterSpacing:6,color:C.g2,marginBottom:10}}>⬡ INSTALLER {LAUNCHER_VER} ⬡</div>
      <div style={{
        fontFamily:"'Orbitron',monospace",
        fontSize:"clamp(52px,14vw,90px)",fontWeight:900,lineHeight:.88,
        background:"linear-gradient(135deg,#00ff88 0%,#00cc44 50%,#ffcc00 100%)",
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
        filter:"drop-shadow(0 0 30px #00ff8866)",
      }}>MXRP</div>
      <div style={{fontFamily:"'Orbitron',monospace",fontSize:"clamp(12px,3vw,22px)",
        letterSpacing:10,color:C.g2,marginTop:4,marginBottom:18}}>E X T R E M O</div>
      <div style={{display:"inline-flex",alignItems:"center",gap:8,
        background:"#00ff8812",border:"1px solid #00ff8835",color:C.g,
        fontSize:11,letterSpacing:2,padding:"5px 18px",borderRadius:20,marginBottom:40}}>
        <span>🧩</span> FABRIC · MC {MC_VERSION} · 38 MODS
      </div>

      {/* Feature grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,maxWidth:440,margin:"0 auto 44px",textAlign:"left"}}>
        {[
          ["⚡","Instalación automática","Java 17 + Fabric incluido"],
          ["🧩","38 mods del servidor","Paquete completo MXRP"],
          ["🔒","Premium & No-Premium","Tú eliges el modo de cuenta"],
          ["🎮","Solo MC "+MC_VERSION,"Versión óptima del servidor"],
        ].map(([ico,t,d])=>(
          <div key={t} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 14px"}}>
            <div style={{fontSize:20,marginBottom:6}}>{ico}</div>
            <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:2}}>{t}</div>
            <div style={{fontSize:11,color:C.dim}}>{d}</div>
          </div>
        ))}
      </div>

      <div style={{maxWidth:280,margin:"0 auto",display:"flex",flexDirection:"column",gap:10}}>
        <Btn onClick={()=>setPhase("config")} size="lg">⚡ Comenzar instalación</Btn>
      </div>
      <div style={{marginTop:18,fontSize:11,color:"#1a4020",letterSpacing:1}}>
        Servidor: <span style={{color:C.g,fontFamily:"monospace"}}>{SERVER_IP}</span>
      </div>
    </div>
  );

  // ── CONFIG ─────────────────────────────────────────────────
  if(phase==="config") return (
    <div style={{animation:"fadeIn .4s ease"}}>

      {/* PASO 1 – Cuenta (solo Premium, login real con Microsoft) */}
      <SCard icon="👤" title="Paso 1 · Cuenta de Microsoft">
        {loginState==="done" && mcProfile ? (
          <div style={{display:"flex",alignItems:"center",gap:14,padding:"16px 18px",
            background:"#0e2016",border:`2px solid ${C.g}`,borderRadius:8}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:C.g,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,
              color:"#000",fontWeight:900,flexShrink:0}}>👑</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:700,color:C.g}}>
                {mcProfile.username}
              </div>
              <div style={{fontSize:11,color:C.dim,marginTop:2}}>Sesión de Microsoft iniciada · cuenta premium verificada</div>
            </div>
            <button onClick={()=>{window.mxrp?.auth?.logout?.();setMcProfile(null);setMode(null);setLoginState("idle");}}
              style={{background:"none",border:`1px solid ${C.border}`,borderRadius:6,color:C.dim,
                padding:"7px 12px",cursor:"pointer",fontSize:11,fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>
              Cerrar sesión
            </button>
          </div>
        ) : loginState==="waiting" ? (
          <div style={{textAlign:"center",padding:"22px 18px",background:"#0a120b",
            border:`1px solid ${C.border}`,borderRadius:8}}>
            <div style={{width:34,height:34,margin:"0 auto 14px",borderRadius:"50%",
              border:`3px solid ${C.g}`,borderTopColor:"transparent",
              animation:"spin .8s linear infinite"}}/>
            {deviceInfo ? (
              <>
                <div style={{fontSize:12,color:C.dim,marginBottom:8}}>
                  Se abrió tu navegador. Si no, entra en:
                </div>
                <div style={{fontFamily:"monospace",fontSize:13,color:C.g,marginBottom:8}}>
                  {deviceInfo.verificationUri}
                </div>
                <div style={{fontSize:11,color:C.dim,marginBottom:4}}>Y escribe este código:</div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:22,fontWeight:900,
                  letterSpacing:4,color:"#fff",marginBottom:8}}>{deviceInfo.userCode}</div>
                {secsLeft!=null && (
                  <div style={{fontSize:11,color:secsLeft<60?"#ff6b6b":C.dim}}>
                    Expira en <span style={{fontFamily:"monospace",color:secsLeft<60?"#ff6b6b":C.g}}>{fmtTime(secsLeft)}</span>
                  </div>
                )}
              </>
            ) : (
              <div style={{fontSize:12,color:C.dim}}>Conectando con Microsoft...</div>
            )}
          </div>
        ) : (
          <div onClick={doLogin} style={{
            padding:"20px 18px",borderRadius:8,cursor:"pointer",transition:"all .2s",
            border:`2px solid ${C.border}`,background:"#0a120b",textAlign:"center"}}>
            <div style={{fontSize:30,marginBottom:8}}>👑</div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:700,color:"#fff",marginBottom:5}}>
              INICIAR SESIÓN CON MICROSOFT
            </div>
            <div style={{fontSize:11,color:C.dim,lineHeight:1.5,marginBottom:10}}>
              Necesitas una cuenta de Microsoft con Minecraft Java Edition comprado.
            </div>
            <span style={{fontSize:10,letterSpacing:2,padding:"3px 10px",borderRadius:3,
              background:C.gold+"18",color:C.gold,border:`1px solid ${C.gold}40`}}>CUENTA OFICIAL · OBLIGATORIA</span>
          </div>
        )}
        {err&&<div style={{marginTop:12,fontSize:12,color:"#ff5555",padding:"9px 14px",
          background:"#ff00001a",borderRadius:6,border:"1px solid #ff444440"}}>{err}</div>}
      </SCard>

      {/* PASO 2 – Versión (fijada) */}
      <SCard icon="🎮" title="Paso 2 · Versión de Minecraft">
        <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",
          background:"#0e2016",border:`1px solid ${C.g}`,borderRadius:8}}>
          <div style={{width:24,height:24,borderRadius:"50%",background:C.g,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:13,color:"#000",fontWeight:900,flexShrink:0}}>✓</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:17,fontWeight:700,color:C.g}}>
              Minecraft {MC_VERSION}
            </div>
            <div style={{fontSize:11,color:C.dim,marginTop:3}}>
              Única versión compatible con los 38 mods del servidor {SERVER_IP}
            </div>
          </div>
          <span style={{fontSize:10,padding:"4px 12px",borderRadius:4,letterSpacing:2,
            background:"#00ff8815",color:C.g,border:"1px solid #00ff8840"}}>FIJADA</span>
        </div>
      </SCard>

      {/* PASO 3 – Mods */}
      <SCard icon="🧩" title={`Paso 3 · Mods del paquete MXRP (${mods.size}/${MODS.length} · ${totalMB} MB)`}>
        {/* Search + cat filter */}
        <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="🔍 Buscar mod..." style={{
              flex:1,minWidth:140,background:"#060e07",border:`1px solid ${C.border}`,
              borderRadius:6,color:C.text,fontSize:12,padding:"7px 12px",outline:"none"}}/>
          <button onClick={toggleAll} style={{
            background:"#0e2016",border:`1px solid ${C.border}`,borderRadius:6,
            color:C.g,fontSize:11,fontWeight:600,padding:"7px 14px",cursor:"pointer",
            fontFamily:"'Rajdhani',sans-serif",whiteSpace:"nowrap"}}>
            {MODS.filter(m=>!m.required).every(m=>mods.has(m.name))?"Desact. todos":"Act. todos"}
          </button>
        </div>
        {/* Category tabs */}
        <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
          {Object.entries(CAT_LABELS).map(([id,lbl])=>(
            <button key={id} onClick={()=>setCat(id)} style={{
              padding:"4px 10px",borderRadius:4,cursor:"pointer",fontSize:10,letterSpacing:1,
              fontFamily:"'Rajdhani',sans-serif",fontWeight:600,border:`1px solid ${cat===id?C.g:C.border}`,
              background:cat===id?"#0e2016":"#0a120b",color:cat===id?C.g:C.dim,
              transition:"all .15s",
            }}>{lbl}</button>
          ))}
        </div>
        {/* Mod list */}
        <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:320,overflowY:"auto"}}>
          {filtered.map(mod=>{
            const on=mods.has(mod.name);
            return (
              <div key={mod.name} onClick={()=>toggleMod(mod.name)} style={{
                display:"flex",alignItems:"center",gap:10,padding:"9px 12px",
                borderRadius:6,transition:"all .18s",
                border:`1px solid ${on?"#1e5030":C.card2}`,
                background:on?"#0d1e10":"#0a120b",
                cursor:mod.required?"default":"pointer",
                opacity:mod.required?0.85:1,
              }}>
                <div style={{width:16,height:16,borderRadius:3,flexShrink:0,
                  border:`2px solid ${on?C.g:"#2a5535"}`,
                  background:on?C.g:"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:10,color:"#000",fontWeight:900,transition:"all .18s"}}>
                  {on?"✓":""}
                </div>
                <span style={{fontSize:15,flexShrink:0}}>{mod.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#d8f0e0",display:"flex",
                    alignItems:"center",gap:6,flexWrap:"wrap"}}>
                    {mod.name}
                    {mod.required&&<span style={{fontSize:9,color:"#ffcc0075",letterSpacing:1}}>REQ</span>}
                  </div>
                  <div style={{fontSize:10,color:C.dim}}>{mod.desc}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:10,color:"#2a5035"}}>{mod.size}</div>
                  <div style={{fontSize:9,color:"#1a4020"}}>v{mod.ver}</div>
                </div>
              </div>
            );
          })}
          {filtered.length===0&&<div style={{textAlign:"center",padding:"24px",fontSize:12,color:C.dim}}>
            No se encontraron mods para "{search}"
          </div>}
        </div>
      </SCard>

      {/* PASO 4 – Directorio */}
      <SCard icon="📁" title="Paso 4 · Directorio de instalación">
        <div style={{display:"flex",gap:10}}>
          <input value={dir} readOnly style={{flex:1,background:"#060e07",
            border:`1px solid ${C.border}`,borderRadius:6,color:C.g2,
            fontFamily:"monospace",fontSize:12,padding:"10px 14px",outline:"none"}}/>
          <button onClick={()=>{const o=["C:\\MXRP_Extremo","D:\\Games\\MXRP","C:\\Users\\Usuario\\Desktop\\MXRP"];setDir(o[Math.floor(Math.random()*o.length)]);}}
            style={{padding:"10px 18px",background:"#0e2016",border:`1px solid ${C.border}`,
              borderRadius:6,color:C.g,fontFamily:"'Rajdhani',sans-serif",
              fontSize:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
            📁 Cambiar
          </button>
        </div>
        <div style={{marginTop:8,fontSize:11,color:"#1e4020"}}>
          ℹ️ Java 17, Fabric Loader, Minecraft {MC_VERSION} y {mods.size} mods se instalarán en esta carpeta.
        </div>
      </SCard>

      <div style={{textAlign:"center",paddingTop:4,maxWidth:320,margin:"0 auto"}}>
        <Btn onClick={startInstall} size="lg">⚡ Instalar MXRP Extremo</Btn>
        <div style={{marginTop:10,fontSize:11,color:"#1e4020",letterSpacing:1}}>
          Java 17 · Fabric {MC_VERSION} · {mods.size} mods · {totalMB} MB
        </div>
      </div>
    </div>
  );

  // ── INSTALLING ─────────────────────────────────────────────
  if(phase==="installing") return (
    <div style={{animation:"fadeIn .4s ease"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:700,
          color:C.g,marginBottom:4}}>INSTALANDO MXRP EXTREMO...</div>
        <div style={{fontSize:12,color:C.dim}}>No cierres esta ventana · {mods.size} mods · MC {MC_VERSION}</div>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"22px 24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"center"}}>
          <span style={{fontSize:13,color:C.g2,letterSpacing:1}}>
            {installLog[installLog.length-1]?.label || "Preparando..."}
          </span>
          <span style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:700,color:C.g}}>{pct}%</span>
        </div>
        <div style={{height:9,background:"#060e07",borderRadius:5,overflow:"hidden",marginBottom:8,
          border:`1px solid #0d1a0f`}}>
          <div style={{height:"100%",width:`${pct}%`,borderRadius:5,
            background:`linear-gradient(90deg,${C.g2},${C.g})`,
            transition:"width .4s ease",animation:"glow 2s ease-in-out infinite"}}/>
        </div>
        <div style={{fontSize:11,color:"#2a5535",marginBottom:20}}>
          Descargando e instalando archivos reales — esto puede tardar varios minutos según tu conexión.
        </div>
        <div ref={logRef} style={{display:"flex",flexDirection:"column",gap:5,maxHeight:300,overflowY:"auto"}}>
          {installLog.map((entry,i)=>{
            const isLast = i===installLog.length-1;
            return (
              <div key={i} data-active={isLast||undefined} style={{
                display:"flex",alignItems:"center",gap:10,padding:"7px 12px",borderRadius:6,
                transition:"all .3s",
                border:`1px solid ${isLast?"#1e5030":C.card2}`,
                background:isLast?"#0d1e10":"#0a120b",
                color:entry.warn?"#ffcc66":isLast?C.g:"#2a5535",fontSize:12,
              }}>
                <span style={{width:19,height:19,borderRadius:"50%",flexShrink:0,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,
                  background:isLast?"#00ff8820":"#1a4025",
                  border:isLast?"1px solid #00ff8860":"1px solid transparent"}}>
                  {entry.warn?"⚠":isLast?
                    <span style={{display:"block",width:9,height:9,borderRadius:"50%",
                      border:"2px solid #00ff88",borderTopColor:"transparent",
                      animation:"spin .8s linear infinite"}}/>:"✓"}
                </span>
                <span style={{flex:1}}>{entry.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── DONE ───────────────────────────────────────────────────
  return (
    <div style={{textAlign:"center",padding:"36px 20px",animation:"fadeIn .5s ease"}}>
      <div style={{fontSize:64,marginBottom:16,animation:"pulse 2.5s infinite"}}>✅</div>
      <div style={{fontFamily:"'Orbitron',monospace",fontSize:22,fontWeight:900,
        color:C.g,marginBottom:8}}>¡INSTALACIÓN COMPLETA!</div>
      <div style={{fontSize:14,color:C.dim,marginBottom:28}}>
        MXRP EXTREMO con {mods.size} mods está listo para jugar
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,maxWidth:420,
        margin:"0 auto 28px"}}>
        {[[mode==="premium"?"👑":"🎮",mode==="premium"?"Premium":"No Premium","MODO"],
          ["🧩",`${mods.size} mods`,"FABRIC"],
          ["🎮",`MC ${MC_VERSION}`,"VERSIÓN"],
        ].map(([i,v,k])=>(
          <div key={k} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 10px"}}>
            <div style={{fontSize:24,marginBottom:4}}>{i}</div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:700,color:C.g}}>{v}</div>
            <div style={{fontSize:9,color:C.dim,letterSpacing:2,marginTop:3}}>{k}</div>
          </div>
        ))}
      </div>
      <div style={{maxWidth:280,margin:"0 auto"}}>
        <Btn onClick={()=>onDone({mode,ver:MC_VERSION,mods:[...mods],dir,account:mcProfile})} size="lg">
          🚀 Abrir Launcher
        </Btn>
      </div>
      <div style={{marginTop:20,fontSize:12,color:"#2a5535"}}>
        Servidor: <span style={{color:C.g,fontFamily:"monospace"}}>{SERVER_IP}</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  SETTINGS PANEL
// ══════════════════════════════════════════════════════════════
const STABS=[
  {id:"video",    icon:"🖥️",  label:"Video"},
  {id:"audio",    icon:"🔊",  label:"Audio"},
  {id:"controls", icon:"🕹️",  label:"Controles"},
  {id:"chat",     icon:"💬",  label:"Chat"},
  {id:"mods",     icon:"🧩",  label:"Mods"},
  {id:"launcher", icon:"🚀",  label:"Launcher"},
  {id:"access",   icon:"♿",  label:"Accesib."},
];

function Settings({settings,onSave,onBack}) {
  const [tab, setTab]  = useState("video");
  const [s,   setS]    = useState({...settings});
  const [saved,setSaved]= useState(false);
  const [mf, setMf]    = useState("");
  const [mc, setMc]    = useState("all");
  const set=(k,v)=>setS(p=>({...p,[k]:v}));

  const save=()=>{onSave(s);setSaved(true);setTimeout(()=>setSaved(false),2200);};
  const toggleMod=name=>{
    if(MODS.find(m=>m.name===name)?.required)return;
    const a=[...s.activeMods],i=a.indexOf(name);
    i>=0?a.splice(i,1):a.push(name);
    set("activeMods",a);
  };
  const toggleAllMods=()=>{
    const opt=MODS.filter(m=>!m.required).map(m=>m.name);
    const allOn=opt.every(n=>s.activeMods.includes(n));
    const req=MODS.filter(m=>m.required).map(m=>m.name);
    set("activeMods",allOn?req:[...new Set([...s.activeMods,...opt])]);
  };
  const filteredMods=MODS.filter(m=>
    (mc==="all"||m.cat===mc)&&
    (m.name.toLowerCase().includes(mf.toLowerCase())||m.desc.toLowerCase().includes(mf.toLowerCase()))
  );

  const totalRamGb = (s.maxRam||8);

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",animation:"fadeIn .3s ease"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,paddingBottom:16,
        borderBottom:`1px solid ${C.border}`,marginBottom:16,flexShrink:0,flexWrap:"wrap",gap:10}}>
        <button onClick={onBack} style={{background:"none",border:`1px solid ${C.border}`,
          borderRadius:4,color:C.g,padding:"7px 14px",cursor:"pointer",fontSize:12,
          fontFamily:"'Rajdhani',sans-serif",fontWeight:600,whiteSpace:"nowrap"}}>← Volver</button>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:700,color:C.g}}>⚙ CONFIGURACIÓN</div>
          <div style={{fontSize:10,color:C.dim,letterSpacing:1}}>MXRP EXTREMO · MC {MC_VERSION} · {s.activeMods?.length||0} mods activos</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {saved&&<span style={{fontSize:12,color:C.g,animation:"fadeIn .3s ease"}}>✓ Guardado</span>}
          <button onClick={save} style={{
            background:`linear-gradient(135deg,${C.g2},${C.g})`,border:"none",borderRadius:4,
            color:"#000",padding:"9px 22px",cursor:"pointer",
            fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:700,letterSpacing:1,
            boxShadow:"0 0 14px #00ff8830"}}>Guardar</button>
        </div>
      </div>

      <div style={{display:"flex",gap:0,flex:1,minHeight:0}}>
        {/* Sidebar */}
        <div style={{width:104,flexShrink:0,display:"flex",flexDirection:"column",gap:4,
          paddingRight:12,borderRight:`1px solid ${C.border}`,marginRight:18}}>
          {STABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              display:"flex",flexDirection:"column",alignItems:"center",gap:3,
              padding:"9px 4px",borderRadius:6,cursor:"pointer",transition:"all .15s",
              background:tab===t.id?"#0e2016":"transparent",
              border:`1px solid ${tab===t.id?C.g:C.border}`,
              color:tab===t.id?C.g:C.dim,
              fontSize:10,letterSpacing:1,fontFamily:"'Rajdhani',sans-serif",fontWeight:600,
            }}>
              <span style={{fontSize:18}}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{flex:1,overflowY:"auto",paddingRight:2}}>

          {/* VIDEO */}
          {tab==="video"&&<div style={{animation:"fadeIn .25s ease"}}>
            <SCard icon="🖥️" title="Gráficos">
              <Select label="Modo gráfico" value={s.graphicsMode} onChange={v=>set("graphicsMode",v)}
                options={["Fast","Fancy","Fabulous"]}/>
              <Slider label="Distancia de renderizado" value={s.renderDistance} min={2} max={32}
                unit=" chunks" hint="Mayor = más bonito y más lento" onChange={v=>set("renderDistance",v)}/>
              <Slider label="Distancia de simulación" value={s.simulationDistance} min={5} max={32}
                unit=" chunks" onChange={v=>set("simulationDistance",v)}/>
              <Slider label="FPS máximo" value={s.maxFps} min={10} max={260} unit=" fps"
                onChange={v=>set("maxFps",v)}/>
              <Toggle label="V-Sync" value={s.vsync} onChange={v=>set("vsync",v)}
                hint="Sincroniza FPS con el monitor"/>
              <Toggle label="Pantalla completa" value={s.fullscreen} onChange={v=>set("fullscreen",v)}/>
            </SCard>
            <SCard icon="🌄" title="Calidad visual">
              <Slider label="Campo de visión (FOV)" value={s.fov} min={30} max={110} unit="°"
                onChange={v=>set("fov",v)}/>
              <Slider label="Brillo" value={s.brightness} min={0} max={100} unit="%"
                onChange={v=>set("brightness",v)}/>
              <Slider label="Nivel de Mipmap" value={s.mipmap} min={0} max={4}
                onChange={v=>set("mipmap",v)}/>
              <Select label="Partículas" value={s.particles} onChange={v=>set("particles",v)}
                options={["All","Decreased","Minimal"]}/>
              <Select label="Nubes" value={s.clouds} onChange={v=>set("clouds",v)}
                options={["Off","Fast","Fancy"]}/>
              <Toggle label="Iluminación suave" value={s.smoothLighting}
                onChange={v=>set("smoothLighting",v)}/>
              <Toggle label="Sombras de entidades" value={s.entityShadows}
                onChange={v=>set("entityShadows",v)}/>
              <Toggle label="Oclusión ambiental" value={s.ambientOcclusion}
                onChange={v=>set("ambientOcclusion",v)}/>
            </SCard>
            <SCard icon="🖼️" title="Interfaz de juego">
              <Slider label="Escala de GUI" value={s.guiScale} min={1} max={4}
                onChange={v=>set("guiScale",v)}/>
              <Select label="Indicador de ataque" value={s.attackIndicator}
                onChange={v=>set("attackIndicator",v)} options={["Off","Crosshair","Hotbar"]}/>
              <Toggle label="Balanceo de cámara" value={s.bobView} onChange={v=>set("bobView",v)}
                hint="Efecto de movimiento al caminar"/>
            </SCard>
          </div>}

          {/* AUDIO */}
          {tab==="audio"&&<div style={{animation:"fadeIn .25s ease"}}>
            <SCard icon="🔊" title="Volúmenes">
              {[["masterVol","🔊 Volumen principal"],["musicVol","🎵 Música"],
                ["weatherVol","🌧️ Clima"],["blockVol","🧱 Bloques"],
                ["hostileVol","🐉 Criaturas hostiles"],["friendlyVol","🐄 Criaturas amigables"],
                ["ambientVol","🌿 Ambiente"],["voiceVol","🎙️ Voice Chat"],
              ].map(([k,l])=>(
                <Slider key={k} label={l} value={s[k]||80} min={0} max={100} unit="%"
                  onChange={v=>set(k,v)}/>
              ))}
            </SCard>
          </div>}

          {/* CONTROLS */}
          {tab==="controls"&&<div style={{animation:"fadeIn .25s ease"}}>
            <SCard icon="🖱️" title="Ratón">
              <Slider label="Sensibilidad" value={s.sensitivity} min={1} max={200} unit="%"
                onChange={v=>set("sensitivity",v)}/>
              <Toggle label="Invertir eje Y" value={s.invertMouse}
                onChange={v=>set("invertMouse",v)}/>
              <Toggle label="Raw input" value={s.rawInput} onChange={v=>set("rawInput",v)}
                hint="Sin aceleración del sistema operativo"/>
            </SCard>
            <SCard icon="⌨️" title="Movimiento">
              <Toggle label="Auto-salto" value={s.autoJump} onChange={v=>set("autoJump",v)}
                hint="Salta obstáculos de 1 bloque automáticamente"/>
              <Toggle label="Alternar sprint" value={s.toggleSprint}
                onChange={v=>set("toggleSprint",v)} hint="Un toque para activar/desactivar"/>
              <Toggle label="Alternar agacharse" value={s.toggleSneak}
                onChange={v=>set("toggleSneak",v)}/>
            </SCard>
            <SCard icon="🎮" title="Teclas de juego">
              {[["W","Mover adelante"],["S","Mover atrás"],["A","Izquierda"],["D","Derecha"],
                ["Space","Saltar"],["Shift","Agacharse"],["Ctrl","Sprint"],["E","Inventario"],
                ["F","Cambiar mano"],["Q","Soltar ítem"],["T","Chat"],["/","Comando"],
                ["F3","Debug"],["F5","Perspectiva"],["F1","Ocultar HUD"],["Esc","Pausa"],
              ].map(([k,l])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                  marginBottom:7,padding:"6px 10px",background:"#0a120b",borderRadius:4,
                  border:`1px solid ${C.card2}`}}>
                  <span style={{fontSize:12,color:C.dim}}>{l}</span>
                  <span style={{fontFamily:"monospace",fontSize:11,background:"#1a3320",color:C.g,
                    padding:"3px 11px",borderRadius:3,border:`1px solid ${C.border}`}}>{k}</span>
                </div>
              ))}
            </SCard>
          </div>}

          {/* CHAT */}
          {tab==="chat"&&<div style={{animation:"fadeIn .25s ease"}}>
            <SCard icon="💬" title="Apariencia del chat">
              <Select label="Visibilidad" value={s.chatVisible}
                onChange={v=>set("chatVisible",v)} options={["Shown","Commands Only","Hidden"]}/>
              <Slider label="Opacidad" value={s.chatOpacity} min={0} max={100} unit="%"
                onChange={v=>set("chatOpacity",v)}/>
              <Slider label="Escala del texto" value={s.chatScale} min={50} max={200} unit="%"
                onChange={v=>set("chatScale",v)}/>
              <Slider label="Ancho del chat" value={s.chatWidth} min={80} max={640} unit="px"
                onChange={v=>set("chatWidth",v)}/>
            </SCard>
            <SCard icon="🔧" title="Opciones">
              <Toggle label="Colores en el chat" value={s.chatColors}
                onChange={v=>set("chatColors",v)}/>
              <Toggle label="Mostrar links" value={s.chatLinks}
                onChange={v=>set("chatLinks",v)}/>
            </SCard>
          </div>}

          {/* MODS */}
          {tab==="mods"&&<div style={{animation:"fadeIn .25s ease"}}>
            <SCard icon="🧩" title={`Mods Fabric activos · ${s.activeMods?.length||0}/${MODS.length}`}>
              <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                <input value={mf} onChange={e=>setMf(e.target.value)}
                  placeholder="🔍 Buscar mod..." style={{flex:1,minWidth:130,background:"#060e07",
                    border:`1px solid ${C.border}`,borderRadius:6,color:C.text,
                    fontSize:12,padding:"7px 12px",outline:"none"}}/>
                <button onClick={toggleAllMods} style={{background:"#0e2016",
                  border:`1px solid ${C.border}`,borderRadius:6,color:C.g,fontSize:11,
                  fontWeight:600,padding:"7px 12px",cursor:"pointer",
                  fontFamily:"'Rajdhani',sans-serif",whiteSpace:"nowrap"}}>
                  {MODS.filter(m=>!m.required).every(m=>s.activeMods?.includes(m.name))?"Desact. todos":"Act. todos"}
                </button>
              </div>
              {/* Category tabs */}
              <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
                {Object.entries(CAT_LABELS).map(([id,lbl])=>(
                  <button key={id} onClick={()=>setMc(id)} style={{
                    padding:"3px 9px",borderRadius:4,cursor:"pointer",fontSize:10,
                    fontFamily:"'Rajdhani',sans-serif",fontWeight:600,
                    border:`1px solid ${mc===id?C.g:C.border}`,
                    background:mc===id?"#0e2016":"#0a120b",color:mc===id?C.g:C.dim,
                    transition:"all .15s",
                  }}>{lbl}</button>
                ))}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:420,overflowY:"auto"}}>
                {filteredMods.map(mod=>{
                  const on=s.activeMods?.includes(mod.name);
                  return (
                    <div key={mod.name} onClick={()=>toggleMod(mod.name)} style={{
                      display:"flex",alignItems:"center",gap:10,padding:"10px 13px",
                      borderRadius:6,transition:"all .18s",
                      border:`1px solid ${on?"#1e5030":C.card2}`,
                      background:on?"#0d1e10":"#0a120b",
                      cursor:mod.required?"default":"pointer",
                    }}>
                      <div style={{width:16,height:16,borderRadius:3,flexShrink:0,
                        border:`2px solid ${on?C.g:"#2a5535"}`,
                        background:on?C.g:"transparent",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:10,color:"#000",fontWeight:900}}>
                        {on?"✓":""}
                      </div>
                      <span style={{fontSize:16,flexShrink:0}}>{mod.icon}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:600,color:"#d8f0e0",
                          display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                          {mod.name}
                          {mod.required&&<span style={{fontSize:9,color:"#ffcc0070",
                            letterSpacing:1}}>REQ</span>}
                        </div>
                        <div style={{fontSize:10,color:C.dim}}>{mod.desc} · v{mod.ver}</div>
                      </div>
                      <div style={{fontSize:10,padding:"2px 8px",borderRadius:3,flexShrink:0,
                        background:on?"#00ff8810":"#ff000010",
                        color:on?C.g:"#ff4444",
                        border:`1px solid ${on?"#00ff8830":"#ff444430"}`}}>
                        {on?"ON":"OFF"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SCard>
          </div>}

          {/* LAUNCHER */}
          {tab==="launcher"&&<div style={{animation:"fadeIn .25s ease"}}>
            <SCard icon="👤" title="Cuenta del jugador" accent>
              <TextInput label="Nombre de usuario" value={s.username} onChange={v=>set("username",v)}/>
              <Select label="Modo de cuenta" value={s.mode}
                onChange={v=>set("mode",v)} options={["premium","nopremium"]}/>
              <div style={{padding:"11px 14px",background:"#060e07",border:`1px solid ${C.border}`,
                borderRadius:6,marginBottom:14}}>
                <div style={{fontSize:11,color:C.dim,marginBottom:3}}>Versión de Minecraft</div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,color:C.g,display:"flex",
                  alignItems:"center",gap:10}}>
                  {MC_VERSION} <span style={{fontSize:10,color:C.dim,letterSpacing:1}}>FIJADA</span>
                </div>
              </div>
            </SCard>
            <SCard icon="🌐" title="Servidor MXRP" accent>
              <div style={{padding:"11px 14px",background:"#060e07",border:`1px solid ${C.border}`,
                borderRadius:6,marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:C.g,
                  boxShadow:`0 0 8px ${C.g}`,flexShrink:0}}/>
                <div>
                  <div style={{fontFamily:"monospace",fontSize:14,color:C.g}}>{SERVER_IP}</div>
                  <div style={{fontSize:10,color:C.dim,marginTop:2}}>Puerto: {SERVER_PORT}</div>
                </div>
                <span style={{marginLeft:"auto",fontSize:10,color:C.g,background:"#00ff8815",
                  border:"1px solid #00ff8830",padding:"2px 8px",borderRadius:3,letterSpacing:1}}>EN LÍNEA</span>
              </div>
            </SCard>
            <SCard icon="☕" title="Java y rendimiento">
              <Slider label="RAM mínima" value={s.minRam} min={1} max={8} unit=" GB"
                onChange={v=>set("minRam",v)}/>
              <Slider label="RAM máxima" value={s.maxRam} min={2} max={32} unit=" GB"
                hint={`Recomendado 6-8 GB con 38 mods · Asignando ${totalRamGb} GB`}
                onChange={v=>set("maxRam",v)}/>
              {/* RAM visual bar */}
              <div style={{marginBottom:16}}>
                <div style={{height:8,background:"#060e07",borderRadius:4,overflow:"hidden",
                  border:`1px solid ${C.border}`}}>
                  <div style={{height:"100%",width:`${Math.min((totalRamGb/32)*100,100)}%`,
                    background:`linear-gradient(90deg,${C.g2},${C.g})`,borderRadius:4,
                    transition:"width .3s ease"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:3,fontSize:9,color:"#1a4020"}}>
                  <span>0 GB</span><span>32 GB</span>
                </div>
              </div>
              <TextInput label="Argumentos JVM" value={s.jvmArgs} onChange={v=>set("jvmArgs",v)}
                mono hint="Parámetros avanzados de Java. Modificar con cuidado."/>
            </SCard>
          </div>}

          {/* ACCESIBILIDAD */}
          {tab==="access"&&<div style={{animation:"fadeIn .25s ease"}}>
            <SCard icon="♿" title="Accesibilidad">
              <Select label="Narrador de pantalla" value={s.narrator}
                onChange={v=>set("narrator",v)} options={["Off","All","Chat","System"]}/>
              <Toggle label="Mostrar subtítulos" value={s.subtitles}
                onChange={v=>set("subtitles",v)} hint="Muestra sonidos del mundo como texto"/>
              <Toggle label="Alto contraste" value={s.highContrast}
                onChange={v=>set("highContrast",v)}/>
            </SCard>
          </div>}

        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN MENU (MC-style GUI)
// ══════════════════════════════════════════════════════════════
function MainMenu({profile,onPlay,onSettings,onExit,hasUpdate,onUpdate}) {
  const [t,setT]=useState(new Date());
  const [blink,setBlink]=useState(true);
  useEffect(()=>{
    const ti=setInterval(()=>setT(new Date()),1000);
    const bi=setInterval(()=>setBlink(p=>!p),550);
    return()=>{clearInterval(ti);clearInterval(bi);};
  },[]);
  const hh=t.getHours().toString().padStart(2,"0");
  const mm=t.getMinutes().toString().padStart(2,"0");

  return (
    <div style={{position:"relative",flex:1,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
      minHeight:"calc(100vh - 88px)",overflow:"hidden"}}>

      {/* Panoramic BG */}
      <div style={{position:"absolute",inset:0,zIndex:0,
        background:"radial-gradient(ellipse at 50% 100%,#001a08 0%,transparent 60%),radial-gradient(ellipse at 15% 15%,#00220a 0%,transparent 50%),radial-gradient(ellipse at 85% 20%,#001608 0%,transparent 45%),linear-gradient(180deg,#040c04 0%,#091409 45%,#0c180c 100%)"}}/>
      {/* Grid */}
      <div style={{position:"absolute",inset:0,zIndex:0,
        backgroundImage:"linear-gradient(#00ff8806 1px,transparent 1px),linear-gradient(90deg,#00ff8806 1px,transparent 1px)",
        backgroundSize:"36px 36px",
        WebkitMaskImage:"radial-gradient(ellipse at 50% 50%,black 25%,transparent 72%)",
        maskImage:"radial-gradient(ellipse at 50% 50%,black 25%,transparent 72%)"}}/>
      {/* Scanline */}
      <div style={{position:"absolute",inset:0,zIndex:1,pointerEvents:"none",overflow:"hidden"}}>
        <div style={{position:"absolute",left:0,right:0,height:3,
          background:"linear-gradient(90deg,transparent,#00ff8807,transparent)",
          animation:"scanline 12s linear infinite"}}/>
      </div>

      <div style={{position:"relative",zIndex:2,width:"100%",maxWidth:440,padding:"0 28px",
        animation:"fadeIn .4s ease"}}>
        {/* LOGO */}
        <div style={{textAlign:"center",marginBottom:44}}>
          <div style={{fontFamily:"'Orbitron',monospace",
            fontSize:"clamp(50px,13vw,80px)",fontWeight:900,lineHeight:.88,
            background:"linear-gradient(135deg,#00ff88 0%,#00cc44 50%,#ffcc00 100%)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
            filter:"drop-shadow(0 0 32px #00ff8877)"}}>MXRP</div>
          <div style={{fontFamily:"'Orbitron',monospace",
            fontSize:"clamp(11px,2.8vw,19px)",letterSpacing:9,color:C.g2,marginTop:2}}>
            E X T R E M O
          </div>
          <div style={{marginTop:12,fontSize:10,color:"#2a5535",letterSpacing:2}}>
            FABRIC · MC {MC_VERSION} · {profile.mods.length} MODS
          </div>
        </div>

        {/* MAIN BUTTONS — MC style */}
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
          <Btn onClick={onPlay} size="lg">
            <span style={{fontSize:18}}>▶</span>
            Jugar en MXRP
          </Btn>
          <Btn onClick={onSettings} size="lg">
            <span style={{fontSize:16}}>⚙</span>
            Opciones y ajustes
          </Btn>
          {/* Update button — only visible when update available */}
          {hasUpdate && (
            <button onClick={onUpdate} style={{
              display:"flex",alignItems:"center",justifyContent:"center",gap:8,
              width:"100%",padding:"12px 18px",
              fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:700,
              letterSpacing:2,color:C.gold,textTransform:"uppercase",
              background:"#ffcc0015",border:`2px solid ${C.gold}`,borderRadius:4,
              cursor:"pointer",transition:"all .15s",position:"relative",overflow:"hidden",
              boxShadow:`0 0 18px #ffcc0022`,animation:"pulse 2s infinite",
            }}>
              <span style={{fontSize:16}}>⬆</span>
              Actualización disponible
              <span style={{fontSize:10,background:"#ffcc0030",padding:"2px 6px",
                borderRadius:3,letterSpacing:1}}>NUEVO</span>
            </button>
          )}
          <Btn onClick={onExit} danger size="lg">
            <span style={{fontSize:16}}>✕</span>
            Salir del launcher
          </Btn>
        </div>

        {/* Status bar */}
        <div style={{background:"#0a120b",border:`1px solid ${C.border}`,borderRadius:8,
          padding:"11px 16px",display:"flex",alignItems:"center",
          justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:9,height:9,borderRadius:"50%",background:C.g,
              boxShadow:`0 0 8px ${C.g}`,flexShrink:0}}/>
            <span style={{fontSize:12,color:C.dim,fontFamily:"monospace"}}>{SERVER_IP}</span>
          </div>
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            <span style={{fontSize:11,color:"#2a5535"}}>
              {profile.mode==="premium"?"👑 Premium":"🎮 No Premium"}
            </span>
            <span style={{fontSize:11,color:"#1e4020",fontFamily:"'Orbitron',monospace",fontSize:12}}>
              {hh}<span style={{opacity:blink?1:0,animation:"blink .55s step-end infinite"}}>:</span>{mm}
            </span>
          </div>
        </div>

        {/* Info chips */}
        <div style={{display:"flex",gap:7,justifyContent:"center",flexWrap:"wrap"}}>
          {[["🧩",`${profile.mods.length} mods`],["☕","Java 17"],
            ["🎮",`MC ${MC_VERSION}`],["🌿","Fabric"]].map(([i,l])=>(
            <div key={l} style={{background:C.card,border:`1px solid ${C.border}`,
              borderRadius:4,padding:"4px 11px",fontSize:11,color:C.dim,
              display:"flex",gap:5,alignItems:"center"}}>{i} {l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  EXIT DIALOG
// ══════════════════════════════════════════════════════════════
function ExitDialog({onConfirm,onCancel}) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:300,
      background:"rgba(0,0,0,.8)",backdropFilter:"blur(4px)",
      display:"flex",alignItems:"center",justifyContent:"center",
      animation:"fadeInFast .18s ease"}}>
      <div style={{background:C.card,border:`2px solid ${C.border}`,borderRadius:10,
        padding:"36px 38px",textAlign:"center",maxWidth:330,
        boxShadow:"0 0 80px #00000090",animation:"fadeIn .2s ease"}}>
        <div style={{fontSize:48,marginBottom:14}}>⚠️</div>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:15,fontWeight:700,
          color:"#fff",marginBottom:8}}>¿Salir del launcher?</div>
        <div style={{fontSize:13,color:C.dim,marginBottom:28,lineHeight:1.5}}>
          Se cerrarán todas las sesiones activas del launcher MXRP EXTREMO.
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Btn onClick={onConfirm} danger>✕ Confirmar salida</Btn>
          <Btn onClick={onCancel}>← Cancelar</Btn>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MC LAUNCH SCREEN (GUI que aparece al iniciar Minecraft)
// ══════════════════════════════════════════════════════════════
function MCLaunchScreen({profile,settings,onBack}) {
  const [state,setState]=useState("menu"); // menu|loading|ingame|quitting
  const [loadPct,setLoadPct]=useState(0);
  const [loadMsg,setLoadMsg]=useState("");
  const [showMCSettings,setShowMCSettings]=useState(false);
  const [blink,setBlink]=useState(true);

  const LOAD_MSGS=[
    "Cargando Java 17...","Iniciando Fabric Loader...","Cargando Minecraft "+MC_VERSION+"...",
    "Cargando librerías...","Inicializando mods...","Cargando Fabric API...",
    "Cargando MC Extremo...","Cargando Biomes O' Plenty...","Cargando Iris Shaders...",
    "Preparando assets...","Conectando a "+SERVER_IP+"...","¡Bienvenido a MXRP EXTREMO!",
  ];

  const launchGame=async ()=>{
    setState("loading"); setLoadPct(0); setLoadMsg("Preparando...");
    const off = window.mxrp?.play?.onProgress?.(p=>{
      setLoadMsg(p.label||""); setLoadPct(Math.round(p.pct||0));
    });
    try {
      await window.mxrp.play.launch({
        mcVersion: MC_VERSION,
        account: profile.account,
        settings,
        serverIp: SERVER_IP,
        serverPort: SERVER_PORT,
      });
      setState("ingame");
    } catch(e) {
      setLoadMsg("❌ "+(e.message||"Error al iniciar Minecraft"));
    } finally {
      off?.();
    }
  };

  // Si el proceso de Minecraft se cierra (el jugador cerró la ventana del juego), vuelve al menú
  useEffect(()=>{
    const off = window.mxrp?.play?.onExit?.(()=>setState("menu"));
    return ()=>off?.();
  },[]);

  const quitGame=()=>{
    setState("quitting");
    window.mxrp?.play?.kill?.();
    setTimeout(()=>setState("menu"),1200);
  };

  useEffect(()=>{
    const b=setInterval(()=>setBlink(p=>!p),550);
    return()=>clearInterval(b);
  },[]);

  // MC Settings overlay
  if(showMCSettings) return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",animation:"fadeIn .3s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"0 0 16px",
        borderBottom:`1px solid ${C.border}`,marginBottom:16,flexShrink:0}}>
        <button onClick={()=>setShowMCSettings(false)} style={{background:"none",
          border:`1px solid ${C.border}`,borderRadius:4,color:C.g,padding:"7px 14px",
          cursor:"pointer",fontSize:12,fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>
          ← Volver al juego
        </button>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:700,color:C.g}}>
          🎮 AJUSTES EN PARTIDA
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        <SCard icon="🖥️" title="Gráficos rápidos" accent>
          <Slider label="Distancia de renderizado" value={settings.renderDistance||12}
            min={2} max={32} unit=" chunks" onChange={()=>{}}/>
          <Slider label="FPS máximo" value={settings.maxFps||60} min={10} max={260}
            unit=" fps" onChange={()=>{}}/>
          <Slider label="FOV" value={settings.fov||70} min={30} max={110} unit="°"
            onChange={()=>{}}/>
          <Slider label="Brillo" value={settings.brightness||50} min={0} max={100}
            unit="%" onChange={()=>{}}/>
        </SCard>
        <SCard icon="🔊" title="Audio rápido">
          <Slider label="Volumen principal" value={settings.masterVol||80}
            min={0} max={100} unit="%" onChange={()=>{}}/>
          <Slider label="Música" value={settings.musicVol||70} min={0} max={100}
            unit="%" onChange={()=>{}}/>
          <Slider label="Voice Chat" value={settings.voiceVol||100} min={0} max={100}
            unit="%" onChange={()=>{}}/>
        </SCard>
        <SCard icon="🌐" title="Servidor">
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
            background:"#0e2016",border:`1px solid ${C.g}`,borderRadius:6}}>
            <div style={{width:9,height:9,borderRadius:"50%",background:C.g,
              boxShadow:`0 0 7px ${C.g}`}}/>
            <span style={{fontFamily:"monospace",fontSize:13,color:C.g}}>{SERVER_IP}</span>
            <span style={{marginLeft:"auto",fontSize:10,color:C.g2}}>Conectado</span>
          </div>
        </SCard>
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <Btn onClick={()=>setShowMCSettings(false)}>↩ Reanudar</Btn>
          <Btn onClick={()=>{setShowMCSettings(false);quitGame();}} danger>⏻ Salir al menú</Btn>
        </div>
      </div>
    </div>
  );

  // LOADING screen
  if(state==="loading") return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",minHeight:400,animation:"fadeIn .4s ease"}}>
      <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:700,
        color:C.g,marginBottom:8}}>INICIANDO MINECRAFT...</div>
      <div style={{fontSize:12,color:C.dim,marginBottom:32,fontFamily:"monospace"}}>{loadMsg}</div>
      {/* Big progress bar */}
      <div style={{width:"100%",maxWidth:480,marginBottom:8}}>
        <div style={{height:10,background:"#060e07",borderRadius:5,overflow:"hidden",
          border:`1px solid ${C.border}`}}>
          <div style={{height:"100%",width:`${loadPct}%`,
            background:`linear-gradient(90deg,${C.g2},${C.g})`,
            borderRadius:5,transition:"width .35s ease",
            animation:"glow 2s ease-in-out infinite"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:5,fontSize:11}}>
          <span style={{color:C.dim}}>{loadMsg}</span>
          <span style={{fontFamily:"'Orbitron',monospace",color:C.g,fontWeight:700}}>{loadPct}%</span>
        </div>
      </div>
      <div style={{marginTop:24,display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
        {[["🧩",`${profile.mods.length} mods`],["🎮",`MC ${MC_VERSION}`],
          ["🌐",SERVER_IP],["☕","Java 17"]].map(([i,l])=>(
          <div key={l} style={{background:C.card,border:`1px solid ${C.border}`,
            borderRadius:4,padding:"5px 12px",fontSize:11,color:C.dim,
            display:"flex",gap:5,alignItems:"center"}}>{i} {l}</div>
        ))}
      </div>
    </div>
  );

  // IN-GAME screen
  if(state==="ingame") return (
    <div style={{animation:"fadeIn .5s ease"}}>
      {/* Fake MC viewport */}
      <div style={{
        width:"100%",height:240,borderRadius:8,marginBottom:16,
        background:"linear-gradient(180deg,#1a3a2a 0%,#0d2015 30%,#1a3020 60%,#0a1a0d 100%)",
        border:`1px solid ${C.border}`,overflow:"hidden",position:"relative",
        display:"flex",alignItems:"center",justifyContent:"center",
      }}>
        {/* Fake horizon */}
        <div style={{position:"absolute",inset:0,
          background:"radial-gradient(ellipse at 50% 40%,#00ff8808 0%,transparent 60%)"}}>
          {/* Fake blocks */}
          {Array.from({length:18},(_,i)=>(
            <div key={i} style={{
              position:"absolute",
              bottom:Math.random()*80+20,
              left:`${Math.random()*95}%`,
              width:Math.random()*22+10,
              height:Math.random()*22+10,
              background:`hsl(${130+Math.random()*20},${40+Math.random()*20}%,${12+Math.random()*12}%)`,
              border:`1px solid hsl(130,30%,8%)`,
              opacity:.7,
            }}/>
          ))}
        </div>
        <div style={{position:"relative",textAlign:"center"}}>
          <div style={{fontSize:11,color:C.g2,letterSpacing:3,marginBottom:6}}>MINECRAFT ACTIVO</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:700,color:C.g}}>
            {SERVER_IP}
          </div>
          <div style={{fontSize:11,color:C.dim,marginTop:4}}>
            {profile.account?.username||profile.username||"Player"} · {profile.mode==="premium"?"Premium":"No Premium"}
          </div>
        </div>
        {/* Crosshair */}
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)"}}>
          <div style={{width:14,height:2,background:"#ffffff40",position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)"}}/>
          <div style={{width:2,height:14,background:"#ffffff40",position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)"}}/>
        </div>
      </div>

      {/* In-game action buttons */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
        <Btn onClick={()=>setShowMCSettings(true)}>
          <span style={{fontSize:14}}>⚙</span> Ajustes
        </Btn>
        <Btn onClick={()=>alert(`📡 Conectado a ${SERVER_IP}\n👥 Jugadores: 12/50\n⚡ Ping: 18ms\n🎮 MC ${MC_VERSION}`)}>
          <span style={{fontSize:14}}>📡</span> Servidor
        </Btn>
        <Btn onClick={quitGame} danger>
          <span style={{fontSize:14}}>⏻</span> Salir
        </Btn>
      </div>

      {/* Status cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 16px"}}>
          <div style={{fontSize:10,color:C.dim,letterSpacing:2,marginBottom:8}}>RENDIMIENTO</div>
          {[["FPS",`${settings.maxFps||60} fps`],["RAM",`${settings.maxRam||8} GB asig.`],["Render",`${settings.renderDistance||12} chunks`]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12}}>
              <span style={{color:C.dim}}>{k}</span>
              <span style={{color:C.g,fontFamily:"monospace"}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 16px"}}>
          <div style={{fontSize:10,color:C.dim,letterSpacing:2,marginBottom:8}}>SESIÓN</div>
          {[["Servidor",SERVER_IP],["Usuario",profile.account?.username||profile.username||"Player"],["Mods",`${profile.mods?.length||38} activos`]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12}}>
              <span style={{color:C.dim}}>{k}</span>
              <span style={{color:C.text,fontFamily:"monospace",fontSize:11,maxWidth:120,
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // QUITTING
  if(state==="quitting") return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",minHeight:300,animation:"fadeIn .3s ease"}}>
      <div style={{fontSize:11,letterSpacing:3,color:C.dim,marginBottom:12}}>CERRANDO MINECRAFT...</div>
      <div style={{width:60,height:60,borderRadius:"50%",border:`3px solid ${C.g}`,
        borderTopColor:"transparent",animation:"spin .8s linear infinite",marginBottom:16}}/>
      <div style={{fontSize:12,color:C.dim}}>Guardando mundo y desconectando...</div>
    </div>
  );

  // PRE-LAUNCH MENU
  return (
    <div style={{animation:"fadeIn .4s ease"}}>
      <div style={{textAlign:"center",marginBottom:30}}>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:15,fontWeight:700,color:C.g,marginBottom:4}}>
          🎮 LISTO PARA JUGAR
        </div>
        <div style={{fontSize:12,color:C.dim}}>MC {MC_VERSION} · {profile.mods?.length||38} mods · {SERVER_IP}</div>
      </div>

      {/* Play card */}
      <div style={{background:"#0e2016",border:`2px solid ${C.g}`,borderRadius:10,
        padding:"24px 24px",marginBottom:16,textAlign:"center",
        boxShadow:"0 0 30px #00ff8815"}}>
        <div style={{fontSize:42,marginBottom:12}}>🚀</div>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:900,
          color:C.g,marginBottom:6}}>INICIAR MINECRAFT</div>
        <div style={{fontSize:12,color:C.dim,marginBottom:20,lineHeight:1.5}}>
          Se conectará directamente al servidor<br/>
          <span style={{fontFamily:"monospace",color:C.g2}}>{SERVER_IP}</span>
        </div>
        <Btn onClick={launchGame} size="lg">▶ &nbsp;Jugar ahora</Btn>
      </div>

      {/* Info row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        {[[profile.mode==="premium"?"👑":"🎮",profile.mode==="premium"?"Premium":"No Premium","MODO"],
          ["🧩",`${profile.mods?.length||38} mods`,"FABRIC"],
          ["☕","Java 17","RUNTIME"],
        ].map(([i,v,k])=>(
          <div key={k} style={{background:C.card,border:`1px solid ${C.border}`,
            borderRadius:7,padding:"13px 10px",textAlign:"center"}}>
            <div style={{fontSize:22,marginBottom:4}}>{i}</div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:700,color:C.g}}>{v}</div>
            <div style={{fontSize:9,color:C.dim,letterSpacing:2,marginTop:3}}>{k}</div>
          </div>
        ))}
      </div>

      <Btn onClick={onBack} danger>✕ Volver al launcher</Btn>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  ROOT APP
// ══════════════════════════════════════════════════════════════
function AppInner() {
  const [screen,    setScreen]   = useState("install");
  const [profile,   setProfile]  = useState(null);
  const [settings,  setSettings] = useState({...DEF_SETTINGS});
  const [showExit,  setShowExit] = useState(false);
  const [showUpdate,setShowUpdate]= useState(false); // popup update
  const { updateState, markInstalled } = useUpdateCheck();

  // Muestra popup de actualización cuando detecta nueva versión
  useEffect(()=>{
    if(updateState && updateState !== "ok" && updateState !== "fresh" && updateState !== null) {
      setShowUpdate(true);
    }
  },[updateState]);

  // Badge de notificación en el botón settings si hay update pendiente
  const hasUpdate = updateState && typeof updateState === "object";

  const onInstalled = cfg => {
    setProfile({...cfg, username: settings.username});
    setSettings(p=>({...p, mode:cfg.mode, activeMods:cfg.mods}));
    markInstalled();
    setScreen("menu");
  };
  const onSaveSettings = s => {
    setSettings(s);
    setProfile(p=>p?({...p,mode:s.mode,mods:s.activeMods,username:s.username}):p);
  };
  const onExit = () => { alert("👋 Cerrando MXRP EXTREMO Launcher..."); setShowExit(false); };

  const defProfile = profile || {
    mode:"nopremium", ver:MC_VERSION,
    mods:MODS.map(m=>m.name), dir:"C:\\MXRP_Extremo", username:"Player",
  };

  return (
    <div style={{minHeight:"100vh",background:C.dark,color:C.text,
      fontFamily:"'Rajdhani',sans-serif",position:"relative"}}>
      <GS/>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",
        background:"radial-gradient(ellipse at 20% 50%,#003311 0%,transparent 50%),radial-gradient(ellipse at 80% 10%,#001a06 0%,transparent 40%)"}}/>
      <Particles/>

      {/* ── App frame ── */}
      <div style={{position:"relative",zIndex:1,maxWidth:900,margin:"0 auto",
        minHeight:"100vh",display:"flex",flexDirection:"column"}}>

        {/* Title bar */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"9px 20px",borderBottom:`1px solid #0c180c`,background:"#050b05",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:14,color:C.g}}>⬡</span>
            <span style={{fontFamily:"'Orbitron',monospace",fontSize:11,color:C.g2,letterSpacing:2}}>
              MXRP EXTREMO · {LAUNCHER_VER} · MC {MC_VERSION}
            </span>
            {/* Update badge */}
            {hasUpdate&&(
              <button onClick={()=>setShowUpdate(true)} style={{
                background:"#ffcc0020",border:"1px solid #ffcc0060",borderRadius:10,
                color:C.gold,fontSize:10,padding:"2px 8px",cursor:"pointer",
                fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:1,
                animation:"pulse 2s infinite",display:"flex",alignItems:"center",gap:4}}>
                ⬆ ACTUALIZAR
              </button>
            )}
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <span style={{fontSize:10,color:"#1e4020",marginRight:4,fontFamily:"monospace",
              display:"flex",alignItems:"center",gap:5}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:C.g,
                display:"inline-block",boxShadow:`0 0 5px ${C.g}`}}/>
              {SERVER_IP}
            </span>
            {["#ffcc00","#00cc66","#ff5555"].map((c,i)=>(
              <div key={i} style={{width:11,height:11,borderRadius:"50%",background:c,opacity:.7}}/>
            ))}
          </div>
        </div>

        {/* Breadcrumb */}
        {screen!=="install"&&(
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"7px 20px",borderBottom:`1px solid #0c180c`,background:"#050b05"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11}}>
              <span onClick={()=>setScreen("menu")} style={{
                cursor:"pointer",color:screen==="menu"?C.g:C.dim,transition:"color .15s"}}>
                INICIO
              </span>
              {screen==="settings"&&<><span style={{color:"#1a3320"}}>›</span>
                <span style={{color:C.g}}>CONFIGURACIÓN</span></>}
              {screen==="play"&&<><span style={{color:"#1a3320"}}>›</span>
                <span style={{color:C.g}}>JUGAR</span></>}
            </div>
            {/* Update pill in breadcrumb */}
            {hasUpdate&&screen!=="install"&&(
              <button onClick={()=>setShowUpdate(true)} style={{
                background:"#ffcc0015",border:"1px solid #ffcc0040",borderRadius:6,
                color:C.gold,fontSize:10,padding:"3px 10px",cursor:"pointer",
                fontFamily:"'Rajdhani',sans-serif",fontWeight:600,letterSpacing:1,
                display:"flex",alignItems:"center",gap:5}}>
                <span style={{animation:"pulse 1.5s infinite",display:"inline-block"}}>⬆</span>
                Actualización disponible v{updateState?.to}
              </button>
            )}
          </div>
        )}

        {/* Main content */}
        <div style={{flex:1,overflowY:"auto",
          padding:screen==="menu"?0:"24px 24px 48px"}}>
          {screen==="install"  && <Installer onDone={onInstalled}/>}
          {screen==="menu"     && (
            <MainMenu
              profile={defProfile}
              hasUpdate={hasUpdate}
              onUpdate={()=>setShowUpdate(true)}
              onPlay={()=>setScreen("play")}
              onSettings={()=>setScreen("settings")}
              onExit={()=>setShowExit(true)}/>
          )}
          {screen==="settings" && (
            <Settings
              settings={settings}
              onSave={onSaveSettings}
              onBack={()=>setScreen("menu")}/>
          )}
          {screen==="play" && (
            <MCLaunchScreen
              profile={defProfile}
              settings={settings}
              onBack={()=>setScreen("menu")}/>
          )}
        </div>
      </div>

      {/* ── OVERLAYS ── */}
      {showExit && (
        <ExitDialog onConfirm={onExit} onCancel={()=>setShowExit(false)}/>
      )}

      {/* Update popup */}
      {showUpdate && updateState?.type==="update" && (
        <UpdatePopup
          from={updateState.from}
          to={updateState.to}
          onUpdate={()=>{ markInstalled(); setShowUpdate(false); }}
          onDismiss={()=>setShowUpdate(false)}/>
      )}

      {/* First-time welcome */}
      {updateState==="fresh" && !showUpdate && screen==="menu" && (
        <WelcomePopup ver={LAUNCHER_VER} onContinue={()=>markInstalled()}/>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  BOOTSTRAP — carga la config remota (mods/versión) ANTES de
//  montar el resto de la app, para que todo (incluido el chequeo
//  de actualización) use ya los valores más recientes.
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [configReady, setConfigReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const remote = await window.mxrp?.config?.getRemote?.(CONFIG_URL);
        if (remote) {
          if (Array.isArray(remote.mods)) MODS = remote.mods;
          if (Array.isArray(remote.changelog)) CHANGELOG = remote.changelog;
          if (remote.launcherVer) LAUNCHER_VER = remote.launcherVer;
        }
      } catch (_) {
        // Sin internet o sin CONFIG_URL configurada → se usa la config local del .jsx
      }
      setConfigReady(true);
    })();
  }, []);

  if (!configReady) {
    return (
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.dark}}>
        <GS/>
        <div style={{width:40,height:40,borderRadius:"50%",border:`3px solid ${C.g}`,
          borderTopColor:"transparent",animation:"spin .8s linear infinite"}}/>
      </div>
    );
  }

  return <AppInner/>;
}
