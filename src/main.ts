const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const envDiv = document.getElementById("env")!;
const results = document.getElementById("results")!;
const probeBtn = document.getElementById("probeBtn")! as HTMLButtonElement;

envDiv.innerHTML = `
  <h3>Environment</h3>
  <div>VITE_SUPABASE_URL present? <strong class="${url ? "ok" : "err"}">${!!url}</strong></div>
  <div>VITE_SUPABASE_ANON_KEY present? <strong class="${key ? "ok" : "err"}">${!!key}</strong></div>
  ${!url || !key ? `<div class="warn">Set both variables in Vercel and redeploy.</div>` : ""}
`;

function li(text: string, cls: "ok" | "warn" | "err" = "ok") {
  const item = document.createElement("li");
  item.className = cls;
  item.textContent = text;
  results.appendChild(item);
}

async function probe() {
  results.innerHTML = "";

  if (!url) {
    li("VITE_SUPABASE_URL is missing.", "err");
    return;
  }
  if (!key) {
    li("VITE_SUPABASE_ANON_KEY is missing.", "err");
    return;
  }

  // Probe #1: Auth health (doesn't require key) — confirms URL is reachable
  try {
    const r = await fetch(`${url}/auth/v1/health`, { method: "GET" });
    if (r.ok) {
      li(`Auth health OK (status ${r.status}).`, "ok");
    } else {
      li(`Auth health NOT OK (status ${r.status}).`, "warn");
    }
  } catch (e: any) {
    li(`Auth health fetch failed: ${e?.message || e}`, "err");
  }

  // Probe #2: REST root with API key — ensures apikey/authorization headers are sent
  try {
    const r2 = await fetch(`${url}/rest/v1/`, {
      method: "GET",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json"
      }
    });

    if (r2.status === 401 || r2.status === 403) {
      li(`REST probe unauthorized (status ${r2.status}). This usually means key missing/invalid.`, "err");
    } else if (r2.ok || r2.status === 404) {
      // 200..299 OK means server responded; 404 is acceptable (no table at root) but headers were accepted.
      li(`REST probe reached server (status ${r2.status}). Headers likely OK.`, "ok");
    } else {
      li(`REST probe got unexpected status ${r2.status}.`, "warn");
    }
  } catch (e: any) {
    li(`REST probe failed: ${e?.message || e}`, "err");
  }
}

probeBtn.addEventListener("click", probe);
