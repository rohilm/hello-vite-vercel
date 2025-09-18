export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  const raw = await req.text().catch(() => "");
  console.log("SINK HIT", { method: req.method, raw });

  let body: unknown = raw;
  try { body = JSON.parse(raw); } catch {}

  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });

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
