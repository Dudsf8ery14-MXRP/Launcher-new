# MXRP Extremo Launcher — versión funcional real

Este launcher ya **descarga e instala Java 17, Minecraft, Fabric y los mods
reales**, y **lanza Minecraft de verdad**, usando login oficial de Microsoft.
Ya no hay ningún paso simulado con `setTimeout`.

## ⚠️ PASO OBLIGATORIO ANTES DE USARLO: registrar tu app en Azure

Microsoft exige que cada launcher de terceros tenga su propio "Client ID".
Es gratis y tarda ~5 minutos:

1. Ve a https://portal.azure.com → **App registrations** → **New registration**
2. Nombre: el que quieras (ej. "MXRP Extremo Launcher")
3. **Supported account types** → "Personal Microsoft accounts only"
4. Crea la app y copia el **Application (client) ID**
5. Ve a **Authentication** → activa **"Allow public client flows"** → Guardar
6. Ve a **API permissions** → asegúrate de que tenga `XboxLive.signin` (delegated)
7. Abre `electron/auth.js` y reemplaza:
   ```js
   const CLIENT_ID = "PON_AQUI_TU_AZURE_CLIENT_ID";
   ```
   por tu Client ID real.

Sin este paso, el botón de login no funcionará (Microsoft rechazará la petición).

## 🧩 Qué es real ahora

| Función | Antes | Ahora |
|---|---|---|
| Login | Botones "Premium/No Premium" decorativos | Login real con Microsoft (device code flow) → Xbox Live → Minecraft Services |
| Java | Animación falsa | Descarga real de Java 17 (Eclipse Temurin / Adoptium) |
| Minecraft | Animación falsa | Descarga real del cliente oficial vía API de Mojang |
| Fabric | Animación falsa | Instalación real del Fabric Loader (meta.fabricmc.net) |
| Mods | Animación falsa | Descarga real desde Modrinth (ver limitación abajo) |
| Jugar | Pantalla decorativa | Lanza `java`/`javaw` real con tu cuenta autenticada |

## ⚠️ Eliminado: modo "No Premium"

El modo "No Premium" (solo pedía un nombre de usuario) se quitó del instalador.
Ese modo solo tiene sentido para evadir la verificación de licencia de
Mojang/Microsoft (servidores con `online-mode=false`), así que no se incluyó.
Ahora el único modo es **Premium**, con login real de Microsoft.

> Si tu servidor de Minecraft actualmente tiene `online-mode=false`, cámbialo
> a `online-mode=true` en su `server.properties` para que valide las cuentas
> reales que inicien sesión desde este launcher.

## ⚠️ Limitación de los mods

No todos los mods de tu lista están en Modrinth. La familia de mods **FTB**
(FTB Library, FTB Chunks, FTB Ranks, FTB Teams, FTB XMod Compat) se distribuye
sobre todo en CurseForge y puede no encontrarse. Si un mod no se encuentra:
- El instalador **no se detiene** — sigue con el resto y al final te avisa
  cuáles faltaron.
- Puedes copiarlos manualmente a la carpeta de mods que se muestra al final
  (dentro de los datos de la app, ver `electron/minecraftInstaller.js → MC_DIR()`).
- O puedes extender `electron/modInstaller.js` para usar la API de CurseForge
  (requiere una API key gratuita en https://console.curseforge.com/).

## 📁 Dónde se instala todo

No se usa `C:\MXRP_Extremo` (ese campo del instalador ahora es solo visual).
Todo se descarga dentro de la carpeta de datos de la app de Electron:
- Windows: `%APPDATA%\mxrp-extremo-launcher\`
- Mac: `~/Library/Application Support/mxrp-extremo-launcher/`
- Linux: `~/.config/mxrp-extremo-launcher/`

Dentro: `runtime/jdk17` (Java), `minecraft/` (versiones, librerías, assets,
mods), y `mxrp-data.json` (datos guardados, incluido el token de sesión cifrado).

## 🚀 Pasos para correrlo / empaquetarlo

1. `npm install`
2. Configura `CLIENT_ID` en `electron/auth.js` (ver arriba)
3. Prueba en desarrollo: `npm run electron:dev`
   - Pulsa "Iniciar sesión con Microsoft", sigue el código en el navegador
   - Pulsa "Instalar MXRP Extremo" — descargará Java/Minecraft/Fabric/mods reales
   - Entra al launcher y pulsa "Jugar ahora" — debería abrirse Minecraft real
4. Genera el instalador `.exe`: `npm run dist:win`

## 🐞 Si algo falla al lanzar Minecraft

Es la parte más delicada de implementar sin poder probarlo en este momento
contra los servidores reales de Microsoft/Mojang. Si Minecraft no abre o se
cierra al instante:
- Corre con `npm run electron:dev` para ver la consola de DevTools y los
  errores de Node en la terminal.
- Revisa el log de Java: `child.stderr` se reenvía como evento `play:log`
  (puedes mostrarlo en una vista de consola dentro de la UI si quieres depurar).
- Los errores más comunes en launchers caseros son: classpath mal armado,
  natives no extraídos correctamente, o argumentos JVM faltantes para
  versiones de Minecraft con módulos (`--add-opens`, etc.) — todo esto ya
  está cubierto leyendo `arguments.jvm`/`arguments.game` de los JSON
  oficiales, pero puede necesitar ajustes finos según tu sistema operativo.

## 🧩 Cómo añadir/quitar mods (2 formas)

### Forma 1 — Rápida, pero requiere recompilar el .exe
Edita el array `MODS` en `src/App.jsx` (busca `let MODS = [`), añade tu línea
copiando el formato de las demás, y vuelve a correr `npm run dist:win` para
generar un nuevo instalador que tienes que volver a repartir a tus jugadores.

```js
{ name:"Nombre del Mod", ver:"1.0.0", size:"500 KB", icon:"🆕", required:false, cat:"utility", desc:"Descripción" },
```

Si el mod es nuevo y quieres que el instalador lo descargue automáticamente
desde Modrinth con precisión, añade también su slug exacto en
`electron/modInstaller.js` → objeto `SLUG_MAP`:
```js
"Nombre del Mod": "slug-exacto-de-modrinth",
```
(el slug es la parte final de la URL del mod en modrinth.com/mod/ESTO-DE-AQUI)

### Forma 2 — Sin recompilar nada, los jugadores reciben los mods solos
Esta es la que te recomiendo para el día a día. Funciona así:

1. Sube tu propia copia de `mxrp-remote-config.example.json` (ya incluido en
   este proyecto) a algún lugar público — la forma más fácil es un repo de
   GitHub: subes el archivo, y usas su URL "raw", algo como:
   ```
   https://raw.githubusercontent.com/tu-usuario/tu-repo/main/mxrp-remote-config.json
   ```
2. Pega esa URL en `src/App.jsx`, en la constante `CONFIG_URL` (cerca del
   inicio del archivo).
3. Genera el `.exe` UNA VEZ con esa URL ya puesta y repártelo a tus jugadores.
4. De ahí en adelante: para añadir/quitar mods, **solo edita ese JSON** en
   GitHub (mods, changelog, launcherVer) y súbelo. La próxima vez que cada
   jugador abra el launcher, va a leer el JSON actualizado automáticamente
   — sin que tengas que generar ni repartir un nuevo instalador.

> ⚠️ Esta forma 2 solo controla la **lista de mods que se descargan e
> instalan**. No cambia el código del launcher en sí (la UI, el login, el
> lanzador de Minecraft). Para eso necesitas la actualización real del `.exe`
> que se explica abajo.

## 🔄 Cómo actualizar el launcher (.exe) de verdad

El popup de actualización que ya tenías en pantalla solo compara números de
versión guardados localmente — no descarga nada por sí solo. Para que el
launcher se actualice de verdad (nueva UI, fixes de bugs, nueva lógica),
ya está conectado `electron-updater`, que sube y descarga versiones reales
usando **GitHub Releases** (gratis, no necesitas servidor propio):

1. Crea un repositorio en GitHub (puede ser privado o público) para tu launcher.
2. En `package.json`, dentro de `"build" → "publish"`, reemplaza:
   ```json
   "owner": "TU_USUARIO_DE_GITHUB",
   "repo": "TU_REPOSITORIO"
   ```
3. Crea un Personal Access Token en GitHub (Settings → Developer settings →
   Personal access tokens) con permiso `repo`, y expórtalo antes de publicar:
   ```bash
   # Windows (PowerShell)
   $env:GH_TOKEN="tu_token"
   # Mac/Linux
   export GH_TOKEN="tu_token"
   ```
4. Sube la versión en `package.json` (`"version"`) y en `LAUNCHER_VER` dentro
   de `src/App.jsx`, y publica:
   ```bash
   npm run build
   npx electron-builder --win --publish always
   ```
   Esto sube el instalador a un "Release" de tu repo de GitHub, junto con un
   archivo `latest.yml` que es el que `electron-updater` lee para saber si
   hay una versión nueva.
5. La próxima vez que un jugador abra una versión instalada del launcher,
   `electron-updater` (configurado en `electron/main.js`) detecta la nueva
   versión, la descarga en segundo plano y le avisa para reiniciar y aplicarla
   — todo automático, sin que tenga que volver a descargar el instalador
   manualmente desde ningún lado.

> ℹ️ El auto-update solo corre en la app empaquetada (`app.isPackaged`), no
> en `npm run electron:dev`. Y solo funciona una vez que tengas al menos una
> versión publicada con `--publish always`, porque necesita ese `latest.yml`
> de referencia para comparar.

