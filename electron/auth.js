// ══════════════════════════════════════════════════════════════
//  MICROSOFT → XBOX LIVE → MINECRAFT AUTH (FIXED)
// ══════════════════════════════════════════════════════════════

const CLIENT_ID = "4dcca577-40c4-49ee-9406-168af3c108e2";

const AUTHORITY = "https://login.microsoftonline.com/consumers";

const SCOPE = "XboxLive.signin offline_access openid profile";

const DEVICE_CODE_URL = `${AUTHORITY}/oauth2/v2.0/devicecode`;
const TOKEN_URL = `${AUTHORITY}/oauth2/v2.0/token`;

// util sleep
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function postForm(url, params, step = "?") {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });

  const rawText = await res.text();
  let data = {};
  try { data = rawText ? JSON.parse(rawText) : {}; } catch (_) { /* respuesta no era JSON */ }

  if (!res.ok) {
    const err = new Error(
      `[${step}] HTTP ${res.status} — ` +
      (data.error_description || data.error || rawText || "sin detalle")
    );
    err.code = data.error;
    err.description = data.error_description;
    err.status = res.status;
    throw err;
  }

  return data;
}

async function postJson(url, body, step = "?") {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const rawText = await res.text();
  let data = {};
  try { data = rawText ? JSON.parse(rawText) : {}; } catch (_) { /* respuesta no era JSON */ }

  if (!res.ok) {
    throw new Error(
      `[${step}] HTTP ${res.status} — ` +
      (data.Message || data.error || rawText || "sin detalle") +
      (data.XErr ? ` (XErr: ${data.XErr})` : "")
    );
  }

  return data;
}

// 1. Device Code
async function requestDeviceCode() {
  return postForm(DEVICE_CODE_URL, {
    client_id: CLIENT_ID,
    scope: SCOPE,
  }, "devicecode");
}

// 2. Polling FIXED (15 min stable)
async function pollDeviceToken(deviceCode, intervalSeconds = 5, expiresInSeconds = 900) {
  const deadline = Date.now() + expiresInSeconds * 1000;

  let interval = intervalSeconds;

  // 🔥 IMPORTANTE: espera inicial (evita AADSTS70016 instantáneo)
  await sleep(interval * 1000);

  while (Date.now() < deadline) {
    try {
      return await postForm(TOKEN_URL, {
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        client_id: CLIENT_ID,
        device_code: deviceCode,
      }, "token");
} catch (e) {

    // Respuesta oficial OAuth
    switch (e.code) {

        case "authorization_pending":
            console.log("Esperando autorización del usuario...");
            await sleep(interval * 1000);
            continue;

        case "slow_down":
            interval += 5;
            console.log(`Microsoft pidió reducir el polling (${interval}s)`);
            await sleep(interval * 1000);
            continue;

        case "expired_token":
            throw new Error("El código de Microsoft expiró (15 minutos).");

        case "access_denied":
            throw new Error("El usuario canceló el inicio de sesión.");
    }

    // Algunas respuestas incluyen AADSTS70016 en la descripción
    const desc = (e.description || e.message || "").toLowerCase();

    if (
        desc.includes("aadsts70016") ||
        desc.includes("not yet been authorized")
    ) {
        console.log("AADSTS70016: el usuario aún no ha iniciado sesión.");
        await sleep(interval * 1000);
        continue;
    }

    throw e;
}
  }

  throw new Error("⏳ El código expiró (15 min terminados)");
}

// 3. Refresh token
async function refreshMsToken(refreshToken) {
  return postForm(TOKEN_URL, {
    grant_type: "refresh_token",
    client_id: CLIENT_ID,
    refresh_token: refreshToken,
    scope: SCOPE,
  }, "refresh-token");
}

// 4. Microsoft → Xbox Live
async function authXboxLive(msAccessToken) {
  const data = await postJson("https://user.auth.xboxlive.com/user/authenticate", {
    Properties: {
      AuthMethod: "RPS",
      SiteName: "user.auth.xboxlive.com",
      RpsTicket: "d=" + msAccessToken,
    },
    RelyingParty: "http://auth.xboxlive.com",
    TokenType: "JWT",
  }, "xboxlive");

  return {
    token: data.Token,
    uhs: data.DisplayClaims.xui[0].uhs,
  };
}

// 5. Xbox → XSTS
async function authXsts(xblToken) {
  const data = await postJson("https://xsts.auth.xboxlive.com/xsts/authorize", {
    Properties: {
      SandboxId: "RETAIL",
      UserTokens: [xblToken],
    },
    RelyingParty: "rp://api.minecraftservices.com/",
    TokenType: "JWT",
  }, "xsts");

  return {
    token: data.Token,
    uhs: data.DisplayClaims.xui[0].uhs,
  };
}

// 6. Minecraft login
async function authMinecraft(uhs, xstsToken) {
  return postJson(
    "https://api.minecraftservices.com/authentication/login_with_xbox",
    {
      identityToken: `XBL3.0 x=${uhs};${xstsToken}`,
    },
    "minecraft-login"
  );
}

// 7. Profile
async function getMcProfile(mcAccessToken) {
  const res = await fetch(
    "https://api.minecraftservices.com/minecraft/profile",
    {
      headers: {
        Authorization: `Bearer ${mcAccessToken}`,
      },
    }
  );

  if (res.status === 404) {
    throw new Error("❌ Esta cuenta NO tiene Minecraft comprado");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.errorMessage || "Error perfil Minecraft");
  }

  return data;
}

// FULL CHAIN
async function fullChainFromMsToken(msAccessToken) {
  const xbl = await authXboxLive(msAccessToken);
  const xsts = await authXsts(xbl.token);
  const mc = await authMinecraft(xsts.uhs, xsts.token);
  const profile = await getMcProfile(mc.access_token);

  return {
    minecraftAccessToken: mc.access_token,
    uuid: profile.id,
    username: profile.name,
    expiresAt: Date.now() + mc.expires_in * 1000,
  };
}

module.exports = {
  requestDeviceCode,
  pollDeviceToken,
  refreshMsToken,
  fullChainFromMsToken,
};