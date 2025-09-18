// /api/sink.ts — echoes whatever you POST and logs it
export const config = { runtime: "nodejs" };


export default async function handler(req: Request): Promise<Response> {
  const raw = await req.text().catch(() => "");
  // Log to Vercel logs
  console.log("SINK HIT", { method: req.method, raw });

  // Try to parse JSON for nicer viewing
  let body: unknown = raw;
  try { body = JSON.parse(raw); } catch {}

  // Optional CORS for testing from browser
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });

  // Echo back everything we received
  const payload = {
    ok: true,
    method: req.method,
    url: new URL(req.url).pathname + new URL(req.url).search,
    headers: Object.fromEntries(req.headers),
    body,
    receivedAt: new Date().toISOString()
  };
  return new Response(JSON.stringify(payload, null, 2), { status: 200, headers });
}
