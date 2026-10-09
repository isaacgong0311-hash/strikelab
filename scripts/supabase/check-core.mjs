// Pure helpers for scripts/supabase/check.mjs, kept free of I/O so a test can
// run them (src/lib/supabase/check.test.ts).

/** Role claim of a Supabase API key, without verifying it: "anon", "service_role", or null. */
export function keyRole(key) {
  if (typeof key !== "string" || !key) return null;
  // The newer opaque keys carry their role in the prefix.
  if (key.startsWith("sb_publishable_")) return "anon";
  if (key.startsWith("sb_secret_")) return "service_role";
  const parts = key.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

/**
 * Problems with the three Supabase env vars, as { level, message } where level is
 * "fail" or "ok". Never includes a key's value.
 */
export function checkEnv(env) {
  const results = [];
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    results.push({ level: "fail", message: "NEXT_PUBLIC_SUPABASE_URL is not set" });
  } else {
    let parsed = null;
    try { parsed = new URL(url); } catch { /* reported below */ }
    const local = parsed && (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1");
    if (!parsed) results.push({ level: "fail", message: "NEXT_PUBLIC_SUPABASE_URL is not a URL" });
    else if (parsed.protocol !== "https:" && !local) results.push({ level: "fail", message: "NEXT_PUBLIC_SUPABASE_URL must be https (Settings → API → Project URL)" });
    else if (parsed.pathname !== "/" && parsed.pathname !== "") results.push({ level: "fail", message: "NEXT_PUBLIC_SUPABASE_URL should be the bare project URL, with no path (no /rest/v1)" });
    else results.push({ level: "ok", message: `NEXT_PUBLIC_SUPABASE_URL is ${parsed.origin}` });
  }

  if (!anon) results.push({ level: "fail", message: "NEXT_PUBLIC_SUPABASE_ANON_KEY is not set" });
  else if (keyRole(anon) === "service_role") results.push({ level: "fail", message: "NEXT_PUBLIC_SUPABASE_ANON_KEY holds the SERVICE-ROLE key. It is sent to every browser; use the anon/publishable key" });
  else if (keyRole(anon) !== "anon") results.push({ level: "fail", message: "NEXT_PUBLIC_SUPABASE_ANON_KEY is not an anon/publishable key" });
  else results.push({ level: "ok", message: "NEXT_PUBLIC_SUPABASE_ANON_KEY is an anon key" });

  if (!service) results.push({ level: "fail", message: "SUPABASE_SERVICE_ROLE_KEY is not set (the Stripe webhook needs it)" });
  else if (keyRole(service) !== "service_role") results.push({ level: "fail", message: "SUPABASE_SERVICE_ROLE_KEY is not a service-role key" });
  else results.push({ level: "ok", message: "SUPABASE_SERVICE_ROLE_KEY is a service-role key" });

  return results;
}

/** Tables the migrations create in the public schema, from the SQL text of each file. */
export function expectedTables(sqlFiles) {
  const tables = new Set();
  for (const sql of sqlFiles) {
    const withoutComments = sql.replace(/--.*$/gm, "");
    for (const match of withoutComments.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z_][a-z0-9_]*)/gi)) {
      tables.add(match[1].toLowerCase());
    }
  }
  return [...tables].sort();
}

/** Tables the migrations create that a project's PostgREST OpenAPI document doesn't list. */
export function missingTables(openapi, expected) {
  const present = new Set(Object.keys((openapi && openapi.definitions) || {}));
  return expected.filter((table) => !present.has(table));
}

/** Plain-language lines about a project's auth settings (the /auth/v1/settings response). */
export function describeAuth(settings) {
  const lines = [];
  const external = (settings && settings.external) || {};
  lines.push({ level: settings.disable_signup ? "fail" : "ok", message: settings.disable_signup ? "New sign-ups are disabled (Authentication → Sign In / Providers)" : "Sign-ups are enabled" });
  lines.push({ level: external.email === false ? "fail" : "ok", message: external.email === false ? "The email provider is off; email/password sign-in won't work" : "Email sign-in is on" });
  lines.push({
    level: "ok",
    message: settings.mailer_autoconfirm
      ? "Email confirmation is OFF (fine for testing; turn it on before real students sign up)"
      : "Email confirmation is on (the sign-up page shows \"Check your email\")",
  });
  lines.push({ level: "ok", message: external.google ? "Google sign-in is on" : "Google sign-in is off (the button is hidden until it is enabled)" });
  return lines;
}
