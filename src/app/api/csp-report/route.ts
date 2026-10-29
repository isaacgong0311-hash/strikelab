/**
 * POST /api/csp-report — receives Content-Security-Policy-Report-Only
 * violation reports (next.config.ts) and logs one compact line each, so the
 * policy can be tightened from real traffic before it's enforced.
 *
 * Browsers send these without credentials. Nothing is stored; bodies are
 * capped and only the fields needed to fix the policy are logged.
 */
const MAX_BODY = 8_000;

type Report = Record<string, unknown>;

function pick(r: Report) {
  const field = (...keys: string[]) => {
    for (const k of keys) if (typeof r[k] === "string") return (r[k] as string).slice(0, 200);
    return undefined;
  };
  return {
    directive: field("effective-directive", "effectiveDirective", "violated-directive"),
    blocked: field("blocked-uri", "blockedURL"),
    page: field("document-uri", "documentURL"),
  };
}

export async function POST(req: Request) {
  const text = (await req.text().catch(() => "")).slice(0, MAX_BODY);
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  // report-uri sends {"csp-report": {...}}; the Reporting API sends [{body: {...}}].
  const reports: Report[] = Array.isArray(parsed)
    ? parsed.map((p) => (p as { body?: Report }).body).filter((b): b is Report => Boolean(b))
    : [(parsed as { "csp-report"?: Report })["csp-report"]].filter((b): b is Report => Boolean(b));
  for (const r of reports.slice(0, 10)) console.warn("[csp-report]", JSON.stringify(pick(r)));
  return new Response(null, { status: 204 });
}
