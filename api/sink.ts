export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // 👈 allow all origins
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  if (req.method === "OPTIONS") {
    // Preflight request
    return new Response(null, { status: 204, headers });
  }

  const raw = await req.text().catch(() => "");
  let body: unknown = raw;
  try { body = JSON.parse(raw); } catch {}

  return new Response(
    JSON.stringify({
      ok: true,
      method: req.method,
      body,
      receivedAt: new Date().toISOString(),
    }, null, 2),
    { status: 200, headers }
  );
}

